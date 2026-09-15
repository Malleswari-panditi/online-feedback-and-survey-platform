import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ResultsDashboard({ surveys, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load responses and answers from Supabase
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        // Get all responses
        const {
          data: responseData,
          error: responseError,
        } = await supabase
          .from("Responses")
          .select("*");

        if (responseError) {
          throw responseError;
        }

        // Get all answers
        const {
          data: answerData,
          error: answerError,
        } = await supabase
          .from("Answers")
          .select("*");

        if (answerError) {
          throw answerError;
        }

        // Convert Supabase data into the format
        // our Results Dashboard understands
        const formattedResponses = responseData.map(
          (response) => {
            const responseAnswers = {};

            answerData
              .filter(
                (answer) =>
                  answer.response_id === response.id
              )
              .forEach((answer) => {
                responseAnswers[answer.question_id] =
                  answer.answer_text;
              });

            return {
              id: response.id,
              surveyId: response.Survey_id,
              answers: responseAnswers,
              suggestions: response.suggestions || "",
              submittedAt: response.submitted_at,
            };
          }
        );

        setResponses(formattedResponses);
      } catch (error) {
        console.error(
          "Error loading results:",
          error
        );

        setError(
          "Could not load survey results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const totalResponses = responses.length;

  // Export results as CSV
  const exportResults = () => {
    if (responses.length === 0) {
      alert("There are no responses to export.");
      return;
    }

    const rows = [];

    surveys.forEach((survey) => {
      const surveyResponses = responses.filter(
        (response) =>
          response.surveyId === survey.id
      );

      surveyResponses.forEach((response) => {
        survey.questions.forEach((question) => {
          const answer =
            response.answers[question.id] ?? "";

          rows.push({
            Survey: survey.title,
            Question: question.text,
            Answer: answer,
          });
        });

        // Add suggestions to CSV
        rows.push({
          Survey: survey.title,
          Question: "Suggestions / Additional Comments",
          Answer: response.suggestions || "",
        });
      });
    });

    if (rows.length === 0) {
      alert("There are no results to export.");
      return;
    }

    const headers = [
      "Survey",
      "Question",
      "Answer",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(row[header])
              .replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "survey-results.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="builder-page">
        <div className="builder-container">

          <button
            className="back-btn"
            onClick={onBack}
          >
            ← Back to Surveys
          </button>

          <div className="empty-state">
            <h3>Loading results...</h3>
            <p>
              Please wait while we load the survey responses.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="builder-page">
        <div className="builder-container">

          <button
            className="back-btn"
            onClick={onBack}
          >
            ← Back to Surveys
          </button>

          <div className="empty-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">

      <div className="builder-container">

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Surveys
        </button>

        <div className="builder-header">

          <div>
            <h2>Results Dashboard</h2>

            <p>
              View collected feedback and survey statistics.
            </p>
          </div>

          {responses.length > 0 && (
            <button
              className="primary-btn"
              onClick={exportResults}
            >
              ↓ Export CSV
            </button>
          )}

        </div>

        {surveys.length === 0 ? (

          <div className="empty-state">

            <h3>No surveys available</h3>

            <p>
              Create a survey first to view results.
            </p>

          </div>

        ) : (

          <>

            <div className="survey-grid">

              {surveys.map((survey) => {

                const surveyResponses =
                  responses.filter(
                    (response) =>
                      response.surveyId === survey.id
                  );

                return (
                  <div
                    className="survey-card"
                    key={survey.id}
                  >

                    <h3>{survey.title}</h3>

                    <p>
                      {survey.description ||
                        "No description provided."}
                    </p>

                    <div className="survey-info">

                      <span>
                        {survey.questions.length} Questions
                      </span>

                      <span>
                        {surveyResponses.length} Responses
                      </span>

                    </div>

                    {surveyResponses.length === 0 ? (

                      <div className="empty-result">
                        No responses yet.
                      </div>

                    ) : (

                      <div className="results-content">

                        {survey.questions.map(
                          (question, index) => {

                            const questionAnswers =
                              surveyResponses
                                .map(
                                  (response) =>
                                    response.answers[
                                      question.id
                                    ]
                                )
                                .filter(
                                  (answer) =>
                                    answer !== undefined &&
                                    answer !== ""
                                );

                            return (
                              <div
                                className="result-question"
                                key={question.id}
                              >

                                <h4>
                                  {index + 1}.{" "}
                                  {question.text}
                                </h4>

                                <p>
                                  Responses:{" "}
                                  {questionAnswers.length}
                                </p>

                                {/* Multiple Choice */}

                                {question.type ===
                                  "multiple-choice" && (

                                  <div>

                                    {question.options.map(
                                      (option) => {

                                        const count =
                                          questionAnswers.filter(
                                            (answer) =>
                                              answer === option
                                          ).length;

                                        return (
                                          <div
                                            className="result-option"
                                            key={option}
                                          >

                                            <span>
                                              {option}
                                            </span>

                                            <strong>
                                              {count}
                                            </strong>

                                          </div>
                                        );
                                      }
                                    )}

                                  </div>
                                )}

                                {/* Yes / No */}

                                {question.type ===
                                  "yes-no" && (

                                  <div>

                                    <div className="result-option">

                                      <span>Yes</span>

                                      <strong>
                                        {
                                          questionAnswers.filter(
                                            (answer) =>
                                              answer === "Yes"
                                          ).length
                                        }
                                      </strong>

                                    </div>

                                    <div className="result-option">

                                      <span>No</span>

                                      <strong>
                                        {
                                          questionAnswers.filter(
                                            (answer) =>
                                              answer === "No"
                                          ).length
                                        }
                                      </strong>

                                    </div>

                                  </div>
                                )}

                                {/* Rating */}

                                {question.type ===
                                  "rating" && (

                                  <div className="rating-result">

                                    {[1, 2, 3, 4, 5].map(
                                      (rating) => {

                                        const count =
                                          questionAnswers.filter(
                                            (answer) =>
                                              answer ===
                                              String(rating)
                                          ).length;

                                        return (
                                          <div
                                            className="rating-item"
                                            key={rating}
                                          >

                                            <span>
                                              {rating}
                                            </span>

                                            <strong>
                                              {count}
                                            </strong>

                                          </div>
                                        );
                                      }
                                    )}

                                  </div>
                                )}

                                {/* Short Answer */}

                                {question.type ===
                                  "short-answer" && (

                                  <div className="text-results">

                                    {questionAnswers.map(
                                      (
                                        answer,
                                        answerIndex
                                      ) => (

                                        <p
                                          key={answerIndex}
                                        >
                                          "{answer}"
                                        </p>

                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            );
                          }
                        )}

                        {/* Suggestions / Additional Comments */}

                        {surveyResponses.some(
                          (response) =>
                            response.suggestions
                        ) && (

                          <div className="result-question">

                            <h4>
                              Suggestions / Additional Comments
                            </h4>

                            <div className="text-results">

                              {surveyResponses
                                .filter(
                                  (response) =>
                                    response.suggestions
                                )
                                .map(
                                  (
                                    response,
                                    suggestionIndex
                                  ) => (

                                    <p
                                      key={suggestionIndex}
                                    >
                                      "{response.suggestions}"
                                    </p>

                                  )
                                )}

                            </div>

                          </div>

                        )}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

            {/* Overall Statistics */}

            <div className="builder-card">

              <h3>Overall Statistics</h3>

              <div className="survey-info">

                <span>
                  Total Surveys: {surveys.length}
                </span>

                <span>
                  Total Responses: {totalResponses}
                </span>

              </div>

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default ResultsDashboard;