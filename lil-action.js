/**
 * Lil Action Quiz Plugin
 *
 * Standalone JavaScript quiz system that can be embedded on any website
 * Configurable, lightweight, and dependency-free
 *
 * @package LilAction
 * @since 1.0.0
 */

(function () {
  ("use strict");

  // Get config from data attribute
  var container = document.getElementById("la-action-container");
  if (!container) {
    return;
  }

  var configJson = container.getAttribute("data-config");
  if (!configJson) {
    return;
  }

  try {
    var config = JSON.parse(configJson);
  } catch (e) {
    console.error("Lil Action: Invalid config data", e);
    return;
  }

  // Check if enabled
  if (!config.enabled) {
    return;
  }
  var quizData = null;

  if (config.quiz.enabled && config.quiz.questions) {
    // Handle new format with question objects
    var questions = [];
    var options = [];

    for (var i = 0; i < config.quiz.questions.length; i++) {
      var q = config.quiz.questions[i];
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
    if (questions.length > 0 && options.length === 0 && config.quiz.options) {
      options = config.quiz.options;
    }

    quizData = {
      questions: questions,
      options: options,
      count: questions.length,
    };
  }

  // Quiz variables
  var currentQuestionIndex = 0;
  var quizAnswers = [];
  var quizCompleted = false;

  // Quiz functions
  function initializeQuiz() {
    if (!quizData) return;

    currentQuestionIndex = 0;
    quizAnswers = [];
    quizCompleted = false;

    renderQuiz();
    setupQuizEventListeners();
  }

  function renderQuiz() {
    var container = document.getElementById("la-quiz-question-container");
    if (!container) return;

    var html = "";
    for (var i = 0; i < quizData.questions.length; i++) {
      var questionClass =
        i === currentQuestionIndex
          ? "la-quiz-question active"
          : "la-quiz-question";
      html +=
        '<div class="' +
        questionClass +
        '" data-question="' +
        i +
        '">' +
        "<h4>" +
        quizData.questions[i] +
        "</h4>" +
        '<div class="la-quiz-options">';

      for (var j = 0; j < quizData.options[i].length; j++) {
        var selectedClass = quizAnswers[i] === j ? " selected" : "";
        html +=
          '<button type="button" class="la-quiz-option-btn' +
          selectedClass +
          '" data-option="' +
          j +
          '">' +
          quizData.options[i][j] +
          "</button>";
      }

      html += "</div></div>";
    }

    container.innerHTML = html;
    updateQuizProgress();
    updateNavigationButtons();
  }

  function updateQuizProgress() {
    var progressFill = document.getElementById("la-quiz-progress-fill");
    var progressText = document.getElementById("la-quiz-progress-text");

    if (progressFill && progressText) {
      var progress = ((currentQuestionIndex + 1) / quizData.count) * 100;
      progressFill.style.width = progress + "%";
      progressText.textContent =
        "Question " + (currentQuestionIndex + 1) + " of " + quizData.count;
    }
  }

  function updateNavigationButtons() {
    var prevBtn = document.getElementById("la-quiz-prev-btn");
    var nextBtn = document.getElementById("la-quiz-next-btn");

    if (prevBtn) {
      prevBtn.style.display = currentQuestionIndex > 0 ? "block" : "none";
    }

    if (nextBtn) {
      var hasAnswer = quizAnswers[currentQuestionIndex] !== undefined;
      nextBtn.disabled = !hasAnswer;
      nextBtn.textContent =
        currentQuestionIndex === quizData.count - 1
          ? config.quiz.completeLabel
          : "Next";
    }
  }

  function showQuestion(index) {
    var questions = document.querySelectorAll(".la-quiz-question");
    questions.forEach(function (q, i) {
      q.classList.toggle("active", i === index);
    });
    currentQuestionIndex = index;
    updateQuizProgress();
    updateNavigationButtons();
  }

  function selectQuizOption(questionIndex, optionIndex) {
    quizAnswers[questionIndex] = optionIndex;
    renderQuiz();
    updateNavigationButtons();
  }

  function nextQuestion() {
    if (currentQuestionIndex < quizData.count - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    } else {
      completeQuiz();
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
    }
  }

  function completeQuiz() {
    quizCompleted = true;
    var container = document.getElementById("la-quiz-question-container");
    if (container) {
      container.innerHTML =
        '<div class="la-quiz-completed">' +
        "<h4>" +
        config.quiz.completionTitle +
        "</h4>" +
        "<p>" +
        config.quiz.completionMessage +
        "</p>" +
        '<button type="button" id="la-quiz-continue-btn" class="la-quiz-restart-btn">' +
        config.quiz.continueButton +
        "</button>" +
        "</div>";
    }

    // Hide navigation buttons
    document.getElementById("la-quiz-prev-btn").style.display = "none";
    document.getElementById("la-quiz-next-btn").style.display = "none";

    // Setup continue button - redirect to destination
    var continueBtn = document.getElementById("la-quiz-continue-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        // Fire Facebook Pixel CompleteRegistration event
        if (typeof window.fbq !== "undefined") {
          window.fbq("track", "CompleteRegistration", {
            content_name: "Quiz Completion",
            status: true,
          });
        }

        // Redirect to destination URL
        if (config.destination) {
          window.location.href = config.destination;
        } else {
          // No destination - show success message and reload
          var messageEl = document.getElementById("la-quiz-question-container");
          if (messageEl) {
            messageEl.innerHTML =
              '<div class="la-quiz-completed">' +
              "<h4>Thank You!</h4>" +
              "<p>Your responses have been recorded successfully.</p>" +
              "</div>";
          }
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        }
      });
    }
  }

  function setupQuizEventListeners() {
    // Option button clicks
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("la-quiz-option-btn")) {
        var questionIndex = currentQuestionIndex;
        var optionIndex = parseInt(e.target.getAttribute("data-option"));
        selectQuizOption(questionIndex, optionIndex);
      }
    });

    // Navigation button clicks
    var prevBtn = document.getElementById("la-quiz-prev-btn");
    var nextBtn = document.getElementById("la-quiz-next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", previousQuestion);
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", nextQuestion);
    }
  }

  // Render quiz HTML dynamically
  function renderQuizHTML() {
    var container = document.getElementById("la-action-container");
    if (!container) return;

    var html = '<div class="la-card">';

    // Quiz section
    html +=
      '<div id="la-quiz-section">' +
      '<h3 class="la-title">' +
      config.quiz.title +
      "</h3>" +
      '<p class="la-subtitle">' +
      config.quiz.subtitle +
      "</p>" +
      '<div id="la-quiz-progress" class="la-quiz-progress">' +
      '<div class="la-quiz-progress-bar">' +
      '<div class="la-quiz-progress-fill" id="la-quiz-progress-fill" style="width: 0%;"></div>' +
      "</div>" +
      '<span class="la-quiz-progress-text" id="la-quiz-progress-text">Question 1 of ' +
      quizData.count +
      "</span>" +
      "</div>" +
      '<div id="la-quiz-question-container" class="la-quiz-question-container"></div>' +
      '<div class="la-quiz-navigation">' +
      '<button type="button" id="la-quiz-prev-btn" class="la-quiz-nav-btn la-quiz-prev-btn" style="display: none;">Previous</button>' +
      '<button type="button" id="la-quiz-next-btn" class="la-quiz-nav-btn la-quiz-next-btn">Next</button>' +
      "</div>" +
      "</div>";

    html += "</div>";

    container.innerHTML = html;
  }

  // Load styles dynamically with custom colors
  function loadStyles() {
    // Get primary color from config, default to black
    var primaryColor = config.color || "#000000";

    // Generate hover/darker shades (simplified approach)
    var primaryColorHover = darkenColor(primaryColor, 0.1);
    var primaryColorLight = lightenColor(primaryColor, 0.9);

    var style = document.createElement("style");
    style.textContent =
      `
/* Quiz Container Styles */
.la-wrapper {
	width: 100%;
	min-width: 320px;
	max-width: 500px;
	margin: 2rem auto;
	padding: 0 1rem;
}

.la-card {
	background: #ffffff;
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
	color: #111827;
	text-align: center;
	margin-bottom: 0.5rem;
}

.la-subtitle {
	font-size: 0.875rem;
	color: #6b7280;
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
	background-color: #e5e7eb;
	border-radius: 4px;
	margin-bottom: 0.5rem;
	overflow: hidden;
}

.la-quiz-progress-fill {
	height: 100%;
	background: linear-gradient(90deg, ` +
      primaryColor +
      `, ` +
      primaryColorHover +
      `);
	border-radius: 4px;
	transition: width 0.3s ease;
}

.la-quiz-progress-text {
	font-size: 0.875rem;
	color: #6b7280;
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
	color: #111827;
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
	border: 2px solid #d1d5db;
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
	border-color: ` +
      primaryColor +
      `;
	background-color: ` +
      primaryColorLight +
      `;
	color: ` +
      primaryColor +
      `;
}

.la-quiz-option-btn.selected {
	border-color: ` +
      primaryColor +
      `;
	background-color: ` +
      primaryColor +
      `;
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
	background-color: #f3f4f6;
	color: #374151;
}

.la-quiz-prev-btn:hover {
	background-color: #e5e7eb;
}

.la-quiz-next-btn {
	background-color: ` +
      primaryColor +
      `;
	color: #ffffff;
}

.la-quiz-next-btn:hover {
	background-color: ` +
      primaryColorHover +
      `;
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
	color: #111827;
	margin-bottom: 1rem;
}

.la-quiz-completed p {
	color: #6b7280;
	margin-bottom: 2rem;
}

.la-quiz-restart-btn {
	padding: 0.875rem 2rem;
	background-color: ` +
      primaryColor +
      `;
	color: #ffffff;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.la-quiz-restart-btn:hover {
	background-color: ` +
      primaryColorHover +
      `;
}
		`;
    document.head.appendChild(style);
  }

  // Helper function to darken color
  function darkenColor(color, amount) {
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
  function lightenColor(color, amount) {
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

  // Initialize quiz when DOM is ready
  function init() {
    // Load styles
    loadStyles();

    // Render the quiz HTML
    renderQuizHTML();

    // Initialize quiz
    initializeQuiz();
  }

  // Initialize if config is available
  function checkAndInit() {
    // Config is already loaded from data attribute, just init
    init();
  }

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndInit);
  } else {
    checkAndInit();
  }
})();
