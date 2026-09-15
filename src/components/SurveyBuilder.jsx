import { useState } from "react";

function SurveyBuilder({ onBack, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  // ==========================================
  // ADD QUESTION
  // ==========================================

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      type: "multiple-choice",
      options: ["Option 1", "Option 2"],
    };

    setQuestions((currentQuestions) => [
      ...currentQuestions,
      newQuestion,
    ]);
  };

  // ==========================================
  // UPDATE QUESTION
  // ==========================================

  const updateQuestion = (id, field, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === id
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  };

  // ==========================================
  // DELETE QUESTION
  // ==========================================

  const deleteQuestion = (id) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter(
        (question) => question.id !== id
      )
    );
  };

  // ==========================================
  // ADD OPTION
  // ==========================================

  const addOption = (questionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,

              options: [
                ...question.options,
                `Option ${question.options.length + 1}`,
              ],
            }
          : question
      )
    );
  };

  // ==========================================
  // DELETE OPTION
  // ==========================================

  const deleteOption = (
    questionId,
    optionIndex
  ) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,

              options: question.options.filter(
                (_, index) =>
                  index !== optionIndex
              ),
            }
          : question
      )
    );
  };

  // ==========================================
  // SAVE SURVEY
  // ==========================================

  const handleSave = () => {

    // Validate title
    if (!title.trim()) {
      alert("Please enter a survey title.");
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    // Validate question text
    const hasEmptyQuestion = questions.some(
      (question) =>
        !question.text.trim()
    );

    if (hasEmptyQuestion) {
      alert(
        "Please enter text for all questions."
      );
      return;
    }

    // Validate multiple-choice options
    const hasInvalidOptions = questions.some(
      (question) =>
        question.type === "multiple-choice" &&
        (
          question.options.length < 2 ||
          question.options.some(
            (option) => !option.trim()
          )
        )
    );

    if (hasInvalidOptions) {
      alert(
        "Each multiple-choice question must have at least two valid options."
      );
      return;
    }

    // Prepare survey
    const newSurvey = {
      title: title.trim(),
      description: description.trim(),

      questions: questions.map(
        (question) => ({
          ...question,

          text: question.text.trim(),

          options:
            question.type ===
            "multiple-choice"
              ? question.options.map(
                  (option) =>
                    option.trim()
                )
              : [],
        })
      ),
    };

    onSave(newSurvey);
  };

  return (
    <div className="builder-page">

      <div className="builder-container">

        {/* BACK BUTTON */}

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Surveys
        </button>

        {/* HEADER */}

        <div className="builder-header">

          <h2>Create Survey</h2>

          <p>
            Create questions and collect useful feedback.
          </p>

        </div>

        {/* SURVEY DETAILS */}

        <div className="builder-card">

          <div className="form-group">

            <label>
              Survey Title
            </label>

            <input
              type="text"
              placeholder="Enter survey title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Enter survey description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* QUESTIONS HEADER */}

        <div className="questions-header">

          <div>

            <h3>Questions</h3>

            <p>
              Add different types of questions to your survey.
            </p>

          </div>

          <button
            className="primary-btn"
            onClick={addQuestion}
          >
            + Add Question
          </button>

        </div>

        {/* EMPTY QUESTIONS */}

        {questions.length === 0 && (
          <div className="empty-questions">

            <h3>
              No questions added yet
            </h3>

            <p>
              Click "Add Question" to create your first question.
            </p>

          </div>
        )}

        {/* QUESTIONS */}

        {questions.map(
          (question, index) => (

            <div
              className="question-card"
              key={question.id}
            >

              <div className="question-top">

                <h4>
                  Question {index + 1}
                </h4>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteQuestion(
                      question.id
                    )
                  }
                >
                  Delete
                </button>

              </div>

              {/* QUESTION TEXT */}

              <div className="form-group">

                <label>
                  Question
                </label>

                <input
                  type="text"
                  placeholder="Enter your question"
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(
                      question.id,
                      "text",
                      event.target.value
                    )
                  }
                />

              </div>

              {/* QUESTION TYPE */}

              <div className="form-group">

                <label>
                  Question Type
                </label>

                <select
                  value={question.type}
                  onChange={(event) =>
                    updateQuestion(
                      question.id,
                      "type",
                      event.target.value
                    )
                  }
                >

                  <option value="multiple-choice">
                    Multiple Choice
                  </option>

                  <option value="short-answer">
                    Short Answer
                  </option>

                  <option value="rating">
                    Rating
                  </option>

                  <option value="yes-no">
                    Yes / No
                  </option>

                </select>

              </div>

              {/* MULTIPLE CHOICE */}

              {question.type ===
                "multiple-choice" && (

                <div className="options">

                  <label>
                    Options
                  </label>

                  {question.options.map(
                    (
                      option,
                      optionIndex
                    ) => (

                      <div
                        className="option-row"
                        key={optionIndex}
                      >

                        <input
                          type="text"
                          value={option}
                          onChange={(
                            event
                          ) => {

                            const updatedOptions =
                              [
                                ...question.options,
                              ];

                            updatedOptions[
                              optionIndex
                            ] =
                              event.target.value;

                            updateQuestion(
                              question.id,
                              "options",
                              updatedOptions
                            );
                          }}
                        />

                        {question.options.length >
                          2 && (

                          <button
                            className="remove-option-btn"
                            onClick={() =>
                              deleteOption(
                                question.id,
                                optionIndex
                              )
                            }
                          >
                            Remove
                          </button>

                        )}

                      </div>
                    )
                  )}

                  <button
                    className="add-option-btn"
                    onClick={() =>
                      addOption(
                        question.id
                      )
                    }
                  >
                    + Add Option
                  </button>

                </div>
              )}

              {/* SHORT ANSWER PREVIEW */}

              {question.type ===
                "short-answer" && (

                <div className="preview-box">

                  <span>
                    Answer field
                  </span>

                  <div className="preview-input">
                    Student's answer will be entered here
                  </div>

                </div>
              )}

              {/* RATING PREVIEW */}

              {question.type ===
                "rating" && (

                <div className="preview-box">

                  <span>
                    Rating Preview
                  </span>

                  <div className="rating-preview">

                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>

                  </div>

                </div>
              )}

              {/* YES / NO PREVIEW */}

              {question.type ===
                "yes-no" && (

                <div className="preview-box">

                  <span>
                    Answer Preview
                  </span>

                  <div className="yes-no-preview">

                    <button>
                      Yes
                    </button>

                    <button>
                      No
                    </button>

                  </div>

                </div>
              )}

            </div>
          )
        )}

        {/* SAVE BUTTON */}

        {questions.length > 0 && (

          <div className="save-section">

            <button
              className="save-btn"
              onClick={handleSave}
            >
              Save Survey
            </button>

          </div>

        )}

      </div>
    </div>
  );
}

export default SurveyBuilder;