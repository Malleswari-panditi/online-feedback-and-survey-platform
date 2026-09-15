import { useState } from "react";

function SurveyForm({ survey, onBack, onSubmit }) {
  const [answers, setAnswers] = useState({});

  // ==========================================
  // UPDATE ANSWER
  // ==========================================

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }));
  };

  // ==========================================
  // SUBMIT SURVEY
  // ==========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check that every survey question has been answered
    const unansweredQuestion = survey.questions.find(
      (question) => {
        const answer = answers[question.id];

        return (
          answer === undefined ||
          answer === null ||
          String(answer).trim() === ""
        );
      }
    );

    if (unansweredQuestion) {
      alert(
        "Please answer all questions before submitting."
      );
      return;
    }

    // Suggestions are optional, so they are not
    // included in the validation above.

    const response = {
      surveyId: survey.id,
      answers,
      submittedAt: new Date().toISOString(),
    };

    onSubmit(response);
  };

  return (
    <div className="builder-page">

      <div className="builder-container">

        {/* ======================================
            BACK BUTTON
            ====================================== */}

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Surveys
        </button>

        {/* ======================================
            SURVEY HEADER
            ====================================== */}

        <div className="builder-header">

          <h2>{survey.title}</h2>

          <p>
            {survey.description ||
              "Please complete the survey below."}
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* ======================================
              SURVEY QUESTIONS
              ====================================== */}

          {survey.questions.map(
            (question, index) => (

              <div
                className="question-card"
                key={question.id}
              >

                <h4>
                  Question {index + 1}
                </h4>

                <p className="survey-question">
                  {question.text}
                </p>

                {/* =================================
                    MULTIPLE CHOICE
                    ================================= */}

                {question.type ===
                  "multiple-choice" && (

                  <div className="answer-options">

                    {question.options.map(
                      (option, optionIndex) => (

                        <label
                          className="radio-option"
                          key={optionIndex}
                        >

                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={
                              answers[
                                question.id
                              ] === option
                            }
                            onChange={(event) =>
                              handleAnswerChange(
                                question.id,
                                event.target.value
                              )
                            }
                          />

                          <span>{option}</span>

                        </label>

                      )
                    )}

                  </div>
                )}

                {/* =================================
                    SHORT ANSWER
                    ================================= */}

                {question.type ===
                  "short-answer" && (

                  <textarea
                    className="answer-textarea"
                    placeholder="Enter your answer..."
                    value={
                      answers[
                        question.id
                      ] || ""
                    }
                    onChange={(event) =>
                      handleAnswerChange(
                        question.id,
                        event.target.value
                      )
                    }
                  />
                )}

                {/* =================================
                    RATING
                    ================================= */}

                {question.type === "rating" && (

                  <div className="rating-options">

                    {[1, 2, 3, 4, 5].map(
                      (rating) => (

                        <label key={rating}>

                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={rating}
                            checked={
                              answers[
                                question.id
                              ] === String(rating)
                            }
                            onChange={(event) =>
                              handleAnswerChange(
                                question.id,
                                event.target.value
                              )
                            }
                          />

                          <span>{rating}</span>

                        </label>

                      )
                    )}

                  </div>
                )}

                {/* =================================
                    YES / NO
                    ================================= */}

                {question.type ===
                  "yes-no" && (

                  <div className="answer-options">

                    <label className="radio-option">

                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="Yes"
                        checked={
                          answers[
                            question.id
                          ] === "Yes"
                        }
                        onChange={(event) =>
                          handleAnswerChange(
                            question.id,
                            event.target.value
                          )
                        }
                      />

                      <span>Yes</span>

                    </label>

                    <label className="radio-option">

                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value="No"
                        checked={
                          answers[
                            question.id
                          ] === "No"
                        }
                        onChange={(event) =>
                          handleAnswerChange(
                            question.id,
                            event.target.value
                          )
                        }
                      />

                      <span>No</span>

                    </label>

                  </div>
                )}

              </div>
            )
          )}

          {/* ======================================
              OPTIONAL SUGGESTIONS
              ====================================== */}

          <div className="question-card">

            <h4>Suggestions</h4>

            <p className="survey-question">
              Any suggestions or additional comments?
            </p>

            <textarea
              className="answer-textarea"
              placeholder="Share your suggestions here... (Optional)"
              value={answers.suggestions || ""}
              onChange={(event) =>
                handleAnswerChange(
                  "suggestions",
                  event.target.value
                )
              }
            />

          </div>

          {/* ======================================
              SUBMIT BUTTON
              ====================================== */}

          <div className="save-section">

            <button
              type="submit"
              className="save-btn"
            >
              Submit Feedback
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default SurveyForm;