/**
 * Lil Action Quiz Plugin
 *
 * Standalone JavaScript quiz system that can be embedded on any website
 * Configurable, lightweight, and dependency-free
 * Supports multiple quizzes on the same page
 *
 * @package LilAction
 * @since 1.0.0
 */

(function () {
  ("use strict");

  /**
   * LilAction class - handles individual quiz instances
   */
  class LilAction {
    constructor(container, config) {
      this.container = container;
      this.config = config;
      this.containerId = container.id;
      this.quizData = null;
      this.currentQuestionIndex = 0;
      this.quizAnswers = [];
      this.quizCompleted = false;

      this.initialize();
    }

    initialize() {
      this.parseQuizData();
      if (this.quizData) {
        this.applyCustomColors();
        this.renderQuizHTML();
        this.initializeQuizInstance();
      }
    }

    parseQuizData() {
      if (this.config.quiz && this.config.quiz.questions) {
        // Handle new format with question objects
        var questions = [];
        var options = [];

        for (var i = 0; i < this.config.quiz.questions.length; i++) {
          var q = this.config.quiz.questions[i];
          if (typeof q === "object" && q.question && q.options) {
            // New format: { question: '...', options: [...] }
            questions.push(q.question);
            options.push(q.options);
          } else if (typeof q === "string") {
            // Old format: just strings
            questions.push(q);
          }
        }

        // Fill options for old format
        if (
          questions.length > 0 &&
          options.length === 0 &&
          this.config.quiz.options
        ) {
          options = this.config.quiz.options;
        }

        this.quizData = {
          questions: questions,
          options: options,
          count: questions.length,
        };
      }
    }

    initializeQuizInstance() {
      if (!this.quizData) return;

      this.currentQuestionIndex = 0;
      this.quizAnswers = [];
      this.quizCompleted = false;

      this.renderQuiz();
      this.setupQuizEventListeners();
    }

    renderQuiz() {
      var questionContainer = this.container.querySelector(
        ".la-quiz-question-container"
      );
      if (!questionContainer) return;

      var html = "";
      for (var i = 0; i < this.quizData.questions.length; i++) {
        var questionClass =
          i === this.currentQuestionIndex
            ? "la-quiz-question active"
            : "la-quiz-question";
        html +=
          '<div class="' +
          questionClass +
          '" data-question="' +
          i +
          '">' +
          "<h4>" +
          this.quizData.questions[i] +
          "</h4>" +
          '<div class="la-quiz-options">';

        for (var j = 0; j < this.quizData.options[i].length; j++) {
          var selectedClass = this.quizAnswers[i] === j ? " selected" : "";
          html +=
            '<button type="button" class="la-quiz-option-btn' +
            selectedClass +
            '" data-option="' +
            j +
            '">' +
            this.quizData.options[i][j] +
            "</button>";
        }

        html += "</div></div>";
      }

      questionContainer.innerHTML = html;
      this.updateQuizProgress();
      this.updateNavigationButtons();
    }

    updateQuizProgress() {
      var progressFill = this.container.querySelector(".la-quiz-progress-fill");
      var progressText = this.container.querySelector(".la-quiz-progress-text");

      if (progressFill && progressText) {
        var progress =
          ((this.currentQuestionIndex + 1) / this.quizData.count) * 100;
        progressFill.style.width = progress + "%";
        progressText.textContent =
          "Question " +
          (this.currentQuestionIndex + 1) +
          " of " +
          this.quizData.count;
      }
    }

    updateNavigationButtons() {
      var prevBtn = this.container.querySelector(".la-quiz-prev-btn");
      var nextBtn = this.container.querySelector(".la-quiz-next-btn");

      if (prevBtn) {
        prevBtn.style.display =
          this.currentQuestionIndex > 0 ? "block" : "none";
      }

      if (nextBtn) {
        var hasAnswer =
          this.quizAnswers[this.currentQuestionIndex] !== undefined;
        nextBtn.disabled = !hasAnswer;
        nextBtn.textContent =
          this.currentQuestionIndex === this.quizData.count - 1
            ? this.config.quiz.completeLabel
            : "Next";
      }
    }

    showQuestion(index) {
      var questions = this.container.querySelectorAll(".la-quiz-question");
      questions.forEach(function (q, i) {
        q.classList.toggle("active", i === index);
      });
      this.currentQuestionIndex = index;
      this.updateQuizProgress();
      this.updateNavigationButtons();
    }

    selectQuizOption(questionIndex, optionIndex) {
      this.quizAnswers[questionIndex] = optionIndex;

      // Send ViewContent event when user starts quiz (answers first question)
      if (questionIndex === 0 && typeof window.fbq !== "undefined") {
        window.fbq("track", "AddToWishlist", {
          content_name: "Quiz Question Answered",
          content_category: "Quiz",
        });

        // Also send browser event
        var quizStartedEvent = new CustomEvent("quizStarted", {
          detail: { quizId: this.containerId },
        });
        document.dispatchEvent(quizStartedEvent);
      }

      this.renderQuiz();
      this.updateNavigationButtons();
    }

    nextQuestion() {
      if (this.currentQuestionIndex < this.quizData.count - 1) {
        this.currentQuestionIndex++;
        this.showQuestion(this.currentQuestionIndex);
      } else {
        // Send CompleteRegistration event when completing the last quiz question
        if (typeof window.fbq !== "undefined") {
          window.fbq("track", "CompleteRegistration", {
            content_name: "Quiz Completion",
            status: true,
          });
        }
        this.completeQuiz();
      }
    }

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.showQuestion(this.currentQuestionIndex);
      }
    }

    completeQuiz() {
      this.quizCompleted = true;
      var questionContainer = this.container.querySelector(
        ".la-quiz-question-container"
      );
      if (questionContainer) {
        questionContainer.innerHTML =
          '<div class="la-quiz-completed">' +
          "<h4>" +
          this.config.quiz.completionTitle +
          "</h4>" +
          "<p>" +
          this.config.quiz.completionMessage +
          "</p>" +
          '<button type="button" class="la-quiz-continue-btn la-quiz-restart-btn">' +
          this.config.quiz.continueButton +
          "</button>" +
          "</div>";
      }

      // Hide navigation buttons
      var prevBtn = this.container.querySelector(".la-quiz-prev-btn");
      var nextBtn = this.container.querySelector(".la-quiz-next-btn");
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";

      // Setup continue button - redirect to destination
      var continueBtn = this.container.querySelector(".la-quiz-continue-btn");
      if (continueBtn) {
        continueBtn.addEventListener(
          "click",
          function () {
            // Fire Facebook Pixel Lead event when destination button is clicked
            if (typeof window.fbq !== "undefined") {
              window.fbq("track", "Lead", {
                content_name: "Quiz Destination",
                content_category: "Lead Generation",
              });
            }

            // Redirect to destination URL
            if (this.config.destination) {
              window.location.href = this.config.destination;
            } else {
              // No destination - show success message and reload
              if (questionContainer) {
                questionContainer.innerHTML =
                  '<div class="la-quiz-completed">' +
                  "<h4>Thank You!</h4>" +
                  "<p>Your responses have been recorded successfully.</p>" +
                  "</div>";
              }
              setTimeout(function () {
                window.location.reload();
              }, 3000);
            }
          }.bind(this)
        );
      }
    }

    setupQuizEventListeners() {
      // Option button clicks - scoped to this container
      this.container.addEventListener(
        "click",
        function (e) {
          if (e.target.classList.contains("la-quiz-option-btn")) {
            var questionIndex = this.currentQuestionIndex;
            var optionIndex = parseInt(e.target.getAttribute("data-option"));
            this.selectQuizOption(questionIndex, optionIndex);
          }
        }.bind(this)
      );

      // Navigation button clicks
      var prevBtn = this.container.querySelector(".la-quiz-prev-btn");
      var nextBtn = this.container.querySelector(".la-quiz-next-btn");

      if (prevBtn) {
        prevBtn.addEventListener("click", this.previousQuestion.bind(this));
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", this.nextQuestion.bind(this));
      }
    }

    // Render quiz HTML dynamically
    renderQuizHTML() {
      var html = '<div class="la-card">';

      // Quiz section
      html +=
        '<div class="la-quiz-section">' +
        '<h3 class="la-title">' +
        this.config.quiz.title +
        "</h3>" +
        '<p class="la-subtitle">' +
        this.config.quiz.subtitle +
        "</p>" +
        '<div class="la-quiz-progress">' +
        '<div class="la-quiz-progress-bar">' +
        '<div class="la-quiz-progress-fill" style="width: 0%;"></div>' +
        "</div>" +
        '<span class="la-quiz-progress-text">Question 1 of ' +
        this.quizData.count +
        "</span>" +
        "</div>" +
        '<div class="la-quiz-question-container"></div>' +
        '<div class="la-quiz-navigation">' +
        '<button type="button" class="la-quiz-nav-btn la-quiz-prev-btn" style="display: none;">Previous</button>' +
        '<button type="button" class="la-quiz-nav-btn la-quiz-next-btn">Next</button>' +
        "</div>" +
        "</div>";

      html += "</div>";

      this.container.innerHTML = html;
    }

    // Helper function to darken color
    darkenColor(color, amount) {
      if (color.startsWith("#")) {
        var num = parseInt(color.replace("#", ""), 16);
        var r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
        var g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - amount)));
        var b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - amount)));
        return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
      }
      return color;
    }

    // Helper function to lighten color
    lightenColor(color, amount) {
      if (color.startsWith("#")) {
        var num = parseInt(color.replace("#", ""), 16);
        var r = Math.min(
          255,
          Math.floor((num >> 16) + (255 - (num >> 16)) * amount)
        );
        var g = Math.min(
          255,
          Math.floor(
            ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount
          )
        );
        var b = Math.min(
          255,
          Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount)
        );
        return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
      }
      return color;
    }

    // Apply custom colors to container
    applyCustomColors() {
      var primaryColor = this.config.color || "#000000";
      var primaryColorDark = this.darkenColor(primaryColor, 0.3);
      var secColor = this.config.secColor || "#6b7280";
      var secColorLight = this.lightenColor(secColor, 0.8);
      var bgColor = this.config.bgColor || "#ffffff";
      var textColor = this.config.textColor || "#111827";

      this.container.style.setProperty("--la-primary-color", primaryColor);
      this.container.style.setProperty(
        "--la-primary-color-dark",
        primaryColorDark
      );
      this.container.style.setProperty("--la-secondary-color", secColor);
      this.container.style.setProperty(
        "--la-secondary-color-light",
        secColorLight
      );
      this.container.style.setProperty("--la-bg-color", bgColor);
      this.container.style.setProperty("--la-text-color", textColor);
      this.container.style.setProperty(
        "--la-text-secondary",
        this.lightenColor(textColor, 0.5)
      );
    }
  }

  // Find all quiz containers on the page using class selector
  var containers = document.querySelectorAll(".la-action-container");

  if (containers.length === 0) {
    return;
  }

  // Track unique quiz IDs to prevent duplicates
  var processedIds = {};

  // Initialize each quiz container
  containers.forEach(function (container) {
    var containerId = container.id;

    // Skip if no ID assigned
    if (!containerId) {
      console.warn("Lil Action: Container missing ID attribute");
      return;
    }

    // Skip if already processed (duplicate ID)
    if (processedIds[containerId]) {
      console.warn("Lil Action: Duplicate ID detected:", containerId);
      return;
    }

    processedIds[containerId] = true;

    var configJson = container.getAttribute("data-config");
    if (!configJson) {
      return;
    }

    try {
      // Decode HTML entities in the config string
      var decodedConfigJson = configJson
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
      var config = JSON.parse(decodedConfigJson);

      // Create new quiz instance
      new LilAction(container, config);
    } catch (e) {
      console.error("Lil Action: Invalid config data for", containerId, e);
    }
  });

  // Load styles once for all quizzes
  if (!document.getElementById("la-action-styles")) {
    var style = document.createElement("style");
    style.id = "la-action-styles";
    style.textContent = `
/* Quiz Container Styles */
.la-wrapper {
	width: 100%;
	min-width: 320px;
	max-width: 500px;
	margin: 2rem auto;
	padding: 0 1rem;
}

.la-card {
	background: var(--la-bg-color, #ffffff);
	border-radius: 12px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	padding: 2rem;
	border: 1px solid #e5e7eb;
	animation: la-slideIn 0.5s ease-out;
}

@keyframes la-slideIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.la-title {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--la-text-color, #111827);
	text-align: center;
	margin-bottom: 0.5rem;
}

.la-subtitle {
	font-size: 0.875rem;
	color: var(--la-text-secondary, #6b7280);
	text-align: center;
	margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 640px) {
	.la-wrapper {
		padding: 0 0.5rem;
	}

	.la-card {
		padding: 1.5rem;
	}

	.la-title {
		font-size: 1.25rem;
	}
}

/* Quiz Styles */
.la-quiz-progress {
	margin-bottom: 2rem;
}

.la-quiz-progress-bar {
	width: 100%;
	height: 8px;
	background-color: var(--la-secondary-color-light, #e5e7eb);
	border-radius: 4px;
	margin-bottom: 0.5rem;
	overflow: hidden;
}

.la-quiz-progress-fill {
	height: 100%;
	background: var(--la-primary-color, linear-gradient(90deg, #000000, #333333));
	border-radius: 4px;
	transition: width 0.3s ease;
}

.la-quiz-progress-text {
	font-size: 0.875rem;
	color: var(--la-secondary-color, #6b7280);
	font-weight: 500;
}

.la-quiz-question-container {
	margin-bottom: 2rem;
	min-height: 200px;
}

.la-quiz-question {
	display: none;
	text-align: center;
}

.la-quiz-question.active {
	display: block;
}

.la-quiz-question h4 {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--la-text-color, #111827);
	margin-bottom: 1.5rem;
	line-height: 1.4;
}

.la-quiz-options {
	display: grid;
	gap: 0.75rem;
	margin-bottom: 2rem;
}

.la-quiz-option-btn {
	padding: 0.875rem 1rem;
	border: 2px solid var(--la-secondary-color-light, #d1d5db);
	border-radius: 8px;
	background-color: #ffffff;
	color: #374151;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: center;
}

.la-quiz-option-btn:hover {
	border-color: var(--la-primary-color-dark, #000000);
	background-color: var(--la-secondary-color-light, #f5f5f5);
	color: var(--la-primary-color-dark, #000000);
}

.la-quiz-option-btn.selected {
	border-color: var(--la-primary-color, #000000);
	background-color: var(--la-primary-color, #000000);
	color: #ffffff;
}

.la-quiz-navigation {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 2rem;
}

.la-quiz-nav-btn {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.la-quiz-prev-btn {
	background-color: var(--la-secondary-color-light, #f3f4f6);
	color: #374151;
}

.la-quiz-prev-btn:hover {
	background-color: var(--la-secondary-color, #e5e7eb);
}

.la-quiz-next-btn {
	background-color: var(--la-primary-color, #000000);
	color: #ffffff;
}

.la-quiz-next-btn:hover {
	background-color: var(--la-primary-color-dark, #333333);
}

.la-quiz-next-btn:disabled {
	background-color: #9ca3af;
	cursor: not-allowed;
}

.la-quiz-completed {
	text-align: center;
	padding: 2rem 0;
}

.la-quiz-completed h4 {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--la-text-color, #111827);
	margin-bottom: 1rem;
}

.la-quiz-completed p {
	color: var(--la-text-secondary, #6b7280);
	margin-bottom: 2rem;
}

.la-quiz-restart-btn {
	padding: 0.875rem 2rem;
	background-color: var(--la-primary-color, #000000);
	color: #ffffff;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.la-quiz-restart-btn:hover {
	background-color: var(--la-primary-color-dark, #333333);
}
		`;
    document.head.appendChild(style);
  }
})();
