import { useEffect, useState } from "react";
import "./App.css";

import { supabase } from "./lib/supabase";

import SurveyBuilder from "./components/SurveyBuilder";
import SurveyForm from "./components/SurveyForm";
import ResultsDashboard from "./components/ResultsDashboard";

function App() {
  // ==========================================
  // STATE
  // ==========================================

  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState("surveys");
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // ==========================================
  // LOAD SURVEYS AND QUESTIONS
  // ==========================================

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const { data: surveyData, error: surveyError } =
          await supabase
            .from("Surveys")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

        if (surveyError) {
          throw surveyError;
        }

        const { data: questionData, error: questionError } =
          await supabase
            .from("Questions")
            .select("*")
            .order("position", {
              ascending: true,
            });

        if (questionError) {
          throw questionError;
        }

        // Attach questions to their corresponding surveys
        const surveysWithQuestions = surveyData.map((survey) => ({
          ...survey,

          questions: questionData
            .filter(
              (question) =>
                question.Survey_id === survey.id
            )
            .map((question) => ({
              id: question.id,
              text: question.text,
              type: question.type,
              options: question.options || [],
            })),
        }));

        setSurveys(surveysWithQuestions);
      } catch (error) {
        console.error(
          "Error loading surveys:",
          error
        );
      }
    };

    loadSurveys();
  }, []);

  // ==========================================
  // LOAD RESPONSES
  // ==========================================

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const { data: responseData, error: responseError } =
          await supabase
            .from("Responses")
            .select("*");

        if (responseError) {
          throw responseError;
        }

        const formattedResponses = responseData.map(
          (response) => ({
            id: response.id,
            surveyId: response.Survey_id,
            submittedAt: response.submitted_at,
            suggestions: response.suggestions || "",
          })
        );

        setResponses(formattedResponses);
      } catch (error) {
        console.error(
          "Error loading responses:",
          error
        );
      }
    };

    loadResponses();
  }, []);

  // ==========================================
  // CREATE SURVEY
  // ==========================================

  const createSurvey = () => {
    setPage("builder");
  };

  // ==========================================
  // SAVE SURVEY
  // ==========================================

  const saveSurvey = async (newSurvey) => {
    try {
      // --------------------------------------
      // 1. Save survey
      // --------------------------------------

      const { data: surveyData, error: surveyError } =
        await supabase
          .from("Surveys")
          .insert([
            {
              title: newSurvey.title.trim(),
              description: newSurvey.description.trim(),
            },
          ])
          .select()
          .single();

      if (surveyError) {
        throw surveyError;
      }

      // --------------------------------------
      // 2. Prepare question rows
      // --------------------------------------

      const questionRows = newSurvey.questions.map(
        (question, index) => ({
          Survey_id: surveyData.id,
          text: question.text.trim(),
          type: question.type,
          position: index + 1,

          options:
            question.type === "multiple-choice"
              ? question.options.map((option) =>
                  option.trim()
                )
              : null,
        })
      );

      // --------------------------------------
      // 3. Save questions
      // --------------------------------------

      const {
        data: savedQuestions,
        error: questionsError,
      } = await supabase
        .from("Questions")
        .insert(questionRows)
        .select();

      if (questionsError) {
        throw questionsError;
      }

      // --------------------------------------
      // 4. Create local survey
      //    using Supabase UUIDs
      // --------------------------------------

      const savedSurvey = {
        ...newSurvey,
        id: surveyData.id,

        questions: newSurvey.questions.map(
          (question, index) => ({
            ...question,
            id: savedQuestions[index].id,
            text: question.text.trim(),

            options:
              question.type === "multiple-choice"
                ? question.options.map((option) =>
                    option.trim()
                  )
                : [],
          })
        ),
      };

      // --------------------------------------
      // 5. Add survey to application
      // --------------------------------------

      setSurveys((currentSurveys) => [
        savedSurvey,
        ...currentSurveys,
      ]);

      setPage("surveys");

      alert("Survey saved successfully!");
    } catch (error) {
      console.error(
        "Error saving survey:",
        error
      );

      alert(
        `Could not save the survey: ${error.message}`
      );
    }
  };

  // ==========================================
  // OPEN SURVEY
  // ==========================================

  const openSurvey = (survey) => {
    setSelectedSurvey(survey);
    setPage("form");
  };

  // ==========================================
  // SUBMIT RESPONSE
  // ==========================================

  const submitResponse = async (response) => {
    try {
      // --------------------------------------
      // 1. Get optional suggestions
      // --------------------------------------

      const suggestions =
        response.answers.suggestions?.trim() || "";

      // --------------------------------------
      // 2. Remove suggestions from
      //    normal question answers
      // --------------------------------------

      const questionAnswers = Object.entries(
        response.answers
      ).filter(
        ([questionId]) =>
          questionId !== "suggestions"
      );

      // --------------------------------------
      // 3. Save response
      // --------------------------------------

      const {
        data: responseData,
        error: responseError,
      } = await supabase
        .from("Responses")
        .insert([
          {
            Survey_id: response.surveyId,
            suggestions,
          },
        ])
        .select()
        .single();

      if (responseError) {
        throw responseError;
      }

      // --------------------------------------
      // 4. Prepare answer rows
      // --------------------------------------

      const answerRows = questionAnswers.map(
        ([questionId, answer]) => ({
          response_id: responseData.id,
          question_id: questionId,
          answer_text: String(answer),
        })
      );

      // --------------------------------------
      // 5. Save answers
      // --------------------------------------

      if (answerRows.length > 0) {
        const { error: answersError } =
          await supabase
            .from("Answers")
            .insert(answerRows);

        if (answersError) {
          throw answersError;
        }
      }

      // --------------------------------------
      // 6. Update response state
      // --------------------------------------

      const newResponse = {
        id: responseData.id,
        surveyId: responseData.Survey_id,
        submittedAt: responseData.submitted_at,
        suggestions:
          responseData.suggestions || "",
      };

      setResponses((currentResponses) => [
        ...currentResponses,
        newResponse,
      ]);

      // --------------------------------------
      // 7. Return to dashboard
      // --------------------------------------

      setSelectedSurvey(null);
      setPage("surveys");

      alert(
        "Response submitted successfully!"
      );
    } catch (error) {
      console.error(
        "Error submitting response:",
        error
      );

      alert(
        `Could not submit response: ${error.message}`
      );
    }
  };

  // ==========================================
  // GO BACK TO SURVEYS
  // ==========================================

  const goToSurveys = () => {
    setSelectedSurvey(null);
    setPage("surveys");
  };

  // ==========================================
  // SURVEY BUILDER PAGE
  // ==========================================

  if (page === "builder") {
    return (
      <SurveyBuilder
        onBack={goToSurveys}
        onSave={saveSurvey}
      />
    );
  }

  // ==========================================
  // SURVEY FORM PAGE
  // ==========================================

  if (page === "form") {
    return (
      <SurveyForm
        survey={selectedSurvey}
        onBack={goToSurveys}
        onSubmit={submitResponse}
      />
    );
  }

  // ==========================================
  // RESULTS PAGE
  // ==========================================

  if (page === "results") {
    return (
      <ResultsDashboard
        surveys={surveys}
        responses={responses}
        onBack={goToSurveys}
      />
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="app">

      {/* NAVIGATION */}

      <header className="navbar">
        <h1>FeedbackHub</h1>

        <nav>
          <button
            className={
              page === "surveys"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("surveys")
            }
          >
            Surveys
          </button>

          <button
            className={
              page === "results"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("results")
            }
          >
            Results
          </button>
        </nav>
      </header>

      {/* DASHBOARD */}

      <main className="dashboard">

        <div className="dashboard-header">
          <div>
            <h2>Survey Dashboard</h2>

            <p>
              Create and manage your feedback surveys.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={createSurvey}
          >
            + Create Survey
          </button>
        </div>

        {/* SURVEY SECTION */}

        <section className="survey-section">

          {surveys.length === 0 ? (
            <div className="empty-state">
              <h3>No surveys yet</h3>

              <p>
                Create your first survey to get started.
              </p>

              <button
                className="primary-btn"
                onClick={createSurvey}
              >
                Create Your First Survey
              </button>
            </div>
          ) : (
            <div className="survey-grid">

              {surveys.map((survey) => {

                const surveyResponseCount =
                  responses.filter(
                    (response) =>
                      response.surveyId ===
                      survey.id
                  ).length;

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
                        {surveyResponseCount} Responses
                      </span>

                    </div>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        openSurvey(survey)
                      }
                    >
                      Open Survey
                    </button>
                  </div>
                );
              })}

            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default App;