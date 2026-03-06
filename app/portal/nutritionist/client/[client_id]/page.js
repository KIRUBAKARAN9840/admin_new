"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { FaArrowLeft, FaUtensils, FaDumbbell, FaCalendar, FaFire, FaWeight } from "react-icons/fa";

export default function ClientDetails() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.client_id;

  const [client, setClient] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("food"); // 'food' or 'workout'
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch client details
        const clientResponse = await axios.get(`/api/admin/nutritionist_sessions/client/${clientId}`);
        setClient(clientResponse.data.data);

        // Fetch food logs
        const foodResponse = await axios.get(`/api/admin/nutritionist_sessions/client/${clientId}/food-logs`);
        console.log("Food logs response:", foodResponse.data);
        const foodData = foodResponse.data.data.food_logs || [];
        console.log("Food logs array:", foodData);
        setFoodLogs(foodData);

        // Fetch workout logs
        const workoutResponse = await axios.get(`/api/admin/nutritionist_sessions/client/${clientId}/workout-logs`);
        setWorkoutLogs(workoutResponse.data.data.workout_logs || []);

      } catch (err) {
        console.error("Error fetching client data:", err);
        setError(err.response?.data?.detail || "Failed to load client data");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const renderFoodLog = (log) => {
    console.log("Rendering food log:", log);
    // diet_data is an array of meal objects
    const meals = Array.isArray(log.diet_data) ? log.diet_data : [];
    console.log("Meals array:", meals);

    // Calculate total calories from all food items
    const totalCalories = meals.reduce((sum, meal) => {
      if (meal.foodList && Array.isArray(meal.foodList)) {
        return sum + meal.foodList.reduce((foodSum, item) => foodSum + (item.calories || 0), 0);
      }
      return sum;
    }, 0);

    // Filter out meals with no food items
    const mealsWithFood = meals.filter(meal => meal.foodList && meal.foodList.length > 0);
    console.log("Meals with food:", mealsWithFood);

    return (
      <div key={log.record_id} style={{
        background: "#252525",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid #333"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCalendar style={{ color: "#FF5757" }} />
            <span style={{ color: "#fff", fontWeight: "600" }}>
              {formatDate(log.date)}
            </span>
          </div>
          {totalCalories > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FaFire style={{ color: "#FF9800" }} />
              <span style={{ color: "#FF9800", fontWeight: "600" }}>
                {totalCalories} kcal
              </span>
            </div>
          )}
        </div>

        {mealsWithFood.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {mealsWithFood.map((meal) => (
              <div key={meal.id} style={{
                background: "#1e1e1e",
                padding: "12px",
                borderRadius: "6px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ color: "#FF5757", fontSize: "13px", fontWeight: "600" }}>
                    {meal.title}
                  </div>
                  {meal.timeRange && (
                    <div style={{ color: "#999", fontSize: "11px" }}>
                      {meal.timeRange}
                    </div>
                  )}
                </div>
                {meal.tagline && (
                  <div style={{ color: "#666", fontSize: "11px", marginBottom: "8px", fontStyle: "italic" }}>
                    {meal.tagline}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {meal.foodList.map((food, foodIdx) => (
                    <div key={foodIdx || food.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      background: "#151515",
                      borderRadius: "4px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#ccc", fontSize: "12px", fontWeight: "500" }}>
                          {food.name}
                        </div>
                        <div style={{ color: "#666", fontSize: "11px" }}>
                          {food.quantity} • Protein: {food.protein}g • Carbs: {food.carbs}g • Fat: {food.fat}g
                        </div>
                      </div>
                      <div style={{ color: "#FF9800", fontSize: "12px", fontWeight: "600" }}>
                        {food.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#666", fontStyle: "italic" }}>No meal data recorded</div>
        )}
      </div>
    );
  };

  const renderWorkoutLog = (log) => {
    console.log("Rendering workout log:", log);
    // workout_details is an array of muscle group objects
    const muscleGroups = Array.isArray(log.workout_details) ? log.workout_details : [];
    console.log("Muscle groups array:", muscleGroups);

    // Calculate total calories and duration from all exercises
    let totalCalories = 0;
    let totalDuration = 0;

    const allExercises = [];

    muscleGroups.forEach(group => {
      Object.keys(group).forEach(muscleName => {
        const exercises = group[muscleName];
        if (Array.isArray(exercises)) {
          exercises.forEach(exercise => {
            if (exercise.sets && Array.isArray(exercise.sets)) {
              exercise.sets.forEach(set => {
                totalCalories += set.calories || 0;
                totalDuration += set.duration || 0;
              });
            }
            allExercises.push({
              muscle: muscleName,
              name: exercise.name,
              sets: exercise.sets || []
            });
          });
        }
      });
    });

    return (
      <div key={log.record_id} style={{
        background: "#252525",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid #333"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCalendar style={{ color: "#FF5757" }} />
            <span style={{ color: "#fff", fontWeight: "600" }}>
              {formatDate(log.date)}
            </span>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            {totalDuration > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaDumbbell style={{ color: "#4CAF50" }} />
                <span style={{ color: "#4CAF50", fontWeight: "600" }}>
                  {Math.round(totalDuration / 60)} min
                </span>
              </div>
            )}
            {totalCalories > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaFire style={{ color: "#FF9800" }} />
                <span style={{ color: "#FF9800", fontWeight: "600" }}>
                  {totalCalories.toFixed(1)} kcal
                </span>
              </div>
            )}
          </div>
        </div>

        {allExercises.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {allExercises.map((exercise, idx) => {
              // Calculate stats for this exercise
              const exerciseSets = exercise.sets || [];
              const totalReps = exerciseSets.reduce((sum, set) => sum + (set.reps || 0), 0);
              const totalWeight = exerciseSets.reduce((sum, set) => sum + (set.weight || 0), 0);
              const avgWeight = exerciseSets.length > 0 ? totalWeight / exerciseSets.length : 0;

              return (
                <div key={idx} style={{
                  background: "#1e1e1e",
                  padding: "12px",
                  borderRadius: "6px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          background: "#FF5757",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}>
                          {exercise.muscle}
                        </div>
                        <div style={{ color: "#ccc", fontSize: "14px", fontWeight: "600" }}>
                          {exercise.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#999" }}>
                    <div>{exerciseSets.length} {exerciseSets.length === 1 ? 'set' : 'sets'}</div>
                    <div>{totalReps} reps</div>
                    {avgWeight > 0 && <div>{avgWeight} kg</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: "#666", fontStyle: "italic" }}>No workout data recorded</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="users-container">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div style={{ color: "#FF5757", fontSize: "18px" }}>Loading client details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div style={{ color: "#ff4444", fontSize: "16px" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaArrowLeft size={14} />
          Back
        </button>
        <h2 className="users-title">
          <span style={{ color: "#FF5757" }}>Client</span> Details
        </h2>
      </div>

      {/* Client Info Card */}
      <div style={{
        background: "#1e1e1e",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          {client?.profile && (
            <img
              src={client.profile}
              alt={client.name}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #FF5757"
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#fff", fontSize: "24px", marginBottom: "8px" }}>
              {client?.name || "Client"}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", color: "#999", fontSize: "14px" }}>
              <div><span style={{ color: "#666" }}>Email:</span> {client?.email || "-"}</div>
              <div><span style={{ color: "#666" }}>Contact:</span> {client?.contact || "-"}</div>
              <div><span style={{ color: "#666" }}>Location:</span> {client?.location || "-"}</div>
              <div><span style={{ color: "#666" }}>Age:</span> {calculateAge(client?.dob) || client?.age || "-"}</div>
              <div><span style={{ color: "#666" }}>Gender:</span> {client?.gender || "-"}</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "16px",
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #333"
        }}>
          <div style={{
            background: "#252525",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <FaWeight style={{ color: "#FF5757", fontSize: "20px", marginBottom: "8px" }} />
            <div style={{ color: "#fff", fontSize: "20px", fontWeight: "600" }}>
              {client?.weight || "-"}
            </div>
            <div style={{ color: "#999", fontSize: "12px" }}>Weight (kg)</div>
          </div>
          <div style={{
            background: "#252525",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ color: "#4CAF50", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              {client?.height || "-"}
            </div>
            <div style={{ color: "#999", fontSize: "12px" }}>Height (cm)</div>
          </div>
          <div style={{
            background: "#252525",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ color: "#FF9800", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              {client?.bmi || "-"}
            </div>
            <div style={{ color: "#999", fontSize: "12px" }}>BMI</div>
          </div>
          <div style={{
            background: "#252525",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ color: "#2196F3", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              {client?.status === "active" ? "Active" : "Inactive"}
            </div>
            <div style={{ color: "#999", fontSize: "12px" }}>Status</div>
          </div>
        </div>

        {/* Goals & Medical */}
        {(client?.goals || client?.medical_issues || client?.lifestyle) && (
          <div style={{ marginTop: "20px" }}>
            {client?.goals && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#FF5757", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>GOALS</div>
                <div style={{ color: "#ccc", fontSize: "14px" }}>{client.goals}</div>
              </div>
            )}
            {client?.lifestyle && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#FF5757", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>LIFESTYLE</div>
                <div style={{ color: "#ccc", fontSize: "14px" }}>{client.lifestyle}</div>
              </div>
            )}
            {client?.medical_issues && (
              <div>
                <div style={{ color: "#FF5757", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>MEDICAL ISSUES</div>
                <div style={{ color: "#ccc", fontSize: "14px" }}>{client.medical_issues}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div style={{
        background: "#1e1e1e",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "20px"
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("food")}
            style={{
              flex: 1,
              background: activeTab === "food" ? "#FF5757" : "#252525",
              border: "none",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            <FaUtensils />
            Food Logs ({foodLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("workout")}
            style={{
              flex: 1,
              background: activeTab === "workout" ? "#FF5757" : "#252525",
              border: "none",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            <FaDumbbell />
            Workout Logs ({workoutLogs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
          {activeTab === "food" ? (
            foodLogs.length > 0 ? (
              foodLogs.map(renderFoodLog)
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                No food logs recorded for this client
              </div>
            )
          ) : (
            workoutLogs.length > 0 ? (
              workoutLogs.map(renderWorkoutLog)
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                No workout logs recorded for this client
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
