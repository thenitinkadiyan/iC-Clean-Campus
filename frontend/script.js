const adminID1 = "123848";
const adminPassword1 = "nitin";
const adminID2 = "123745";
const adminPassword2 = "deepali";
const staffID1 = "115044";
const staffPassword1 = "mobashir";
const studentID1 = "123781";
const studentPassword1 = "tanisha";
const studentID2 = "124460";
const studentPassword2 = "gurpreet";
const studentID3 = "123902";
const studentPassword3 = "charu";
async function login() {
    const inputs = document.querySelectorAll(".login-box input");

    const loginId = inputs[0].value.trim();
    const password = inputs[1].value;

    if (!loginId || !password) {
        alert("Please enter ID and Password");
        return;
    }

    try {
        const response = await fetch(
            "https://ic-clean-campus.onrender.com/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    login_id: loginId,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Invalid ID or Password");
            return;
        }

        localStorage.setItem(
            "accessToken",
            data.access_token
        );

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(data)
        );

        if (data.role === "student") {
            localStorage.setItem(
                "loggedInStudent",
                JSON.stringify({
                    id: data.user_id,
                    name: data.name,
                    grNumber: data.gr_number,
                    loginId: data.login_id,
                    role: data.role
                })
            );

            window.location.href = "student-dashboard.html";
        }

        else if (data.role === "staff") {
            window.location.href = "staff-dashboard.html";
        }

        
        else if (data.role === "admin") {
            window.location.href = "admin-dashboard.html";
        }

        else if (data.role === "main_admin") {
            window.location.href = "main-admin-dashboard.html";
        }

        else {
            alert("Unknown user role.");
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Server connection failed. Please try again later.");
    }
}
async function registerStudent() {
    const name = document.getElementById("studentName").value.trim();
    const grNumber = document.getElementById("studentGR").value.trim();
    const password = document.getElementById("studentPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !grNumber || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (password.length < 6) {
        alert("Password must contain at least 6 characters");
        return;
    }

    try {
        const response = await fetch(
            "https://ic-clean-campus.onrender.com/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    gr_number: grNumber,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Registration failed");
            return;
        }

        alert("Registration successful! You can now login.");

        document.getElementById("studentName").value = "";
        document.getElementById("studentGR").value = "";
        document.getElementById("studentPassword").value = "";
        document.getElementById("confirmPassword").value = "";

        window.location.href = "login.html";

    } catch (error) {
        console.error("Registration error:", error);
        alert("Backend se connection nahi ho pa raha.");
    }
}
if(document.getElementById("reportCount")){
    updateReportCount();
}
function updateResolvedCount() {
    let reports = JSON.parse(localStorage.getItem("report")) || [];
    let resolvedReports = reports.filter(function(report) {
        return report.status === "Resolved";
    });

    document.getElementById("resolvedCount").textContent = resolvedReports.length;
}
if(document.getElementById("resolvedCount")){
    updateResolvedCount();
}
function loadAdminReports() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    let reportsList = document.getElementById("reportsList");

    if (!reportsList) {
        return;
    }

    if (reports.length === 0) {
        reportsList.innerHTML = "<p>No reports submitted yet.</p>";
        return;
    }

    reportsList.innerHTML = "";

    reports.forEach(function(report, index) {

        let assignedStaff = report.assignedStaff || "Not Assigned";

        reportsList.innerHTML += `
            <div class="admin-report-card">

                <div class="admin-report-top">
                    <h3>Report #${index + 1}</h3>
                    <span class="report-status ${report.status.toLowerCase().replace(" ", "-")}">
                        ${report.status}
                    </span>
                </div>

                <p>
                    <strong>📍 Location:</strong>
                    ${report.location}
                </p>

                <p>
                    <strong>📝 Problem:</strong>
                    ${report.description}
                </p>

                <p>
                    <strong>👷 Assigned Staff:</strong>
                    ${assignedStaff}
                </p>

                <p>
                    <strong>🕐 Reported:</strong>
                    ${report.date}
                </p>

            </div>
        `;
    });
}
function resolveReport(index) {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    reports[index].status = "Resolved";

    localStorage.setItem("report", JSON.stringify(reports));

    loadAdminReports();
    updateAdminStats();
}
if(document.getElementById("reportsList")){
    loadAdminReports();
}
function updateAdminStats() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    let total = reports.length;

    let pending = reports.filter(function(report) {
        return report.status === "Pending";
    }).length;

    let inProgress = reports.filter(function(report) {
        return report.status === "In Progress";
    }).length;

    let resolved = reports.filter(function(report) {
        return report.status === "Resolved";
    }).length;


    document.getElementById("totalReports").textContent = total;
    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("inProgressReports").textContent = inProgress;
    document.getElementById("resolvedReports").textContent = resolved;
}
if(document.getElementById("totalReports")){
    updateAdminStats();
}
function completeCleaning(reportId) {

    const photoInput =
        document.getElementById("afterPhoto-" + reportId);

    if (!photoInput || !photoInput.files[0]) {
        alert("Please upload after-cleaning photo");
        return;
    }

    let reports =
        JSON.parse(localStorage.getItem("report")) || {};

    let index = reports.findIndex(function(report) {
        return String(report.id) === String(reportId);
    });

    if (index === -1) {
        alert("Complaint not found");
        return;
    }

    reports[index].cleaningCompleted = true;
    reports[index].status = "Verification Pending";

    localStorage.setItem(
        "report",
        JSON.stringify(reports)
    );

    alert("Cleaning completed! AI verification started.");

    loadStaffTask();

    setTimeout(function() {

        let reports =
            JSON.parse(localStorage.getItem("report")) || [];

        let index = reports.findIndex(function(report) {
            return String(report.id) === String(reportId);
        });

        if (index === -1) {
            return;
        }

        reports[index].status = "Resolved";
        reports[index].aiVerified = true;


        if (!reports[index].pointsAwarded) {

            let studentGR = reports[index].studentGR;

            if (studentGR) {
                addStudentPoints(studentGR, 10);
                reports[index].pointsAwarded = true;
            }
        }

        localStorage.setItem(
            "report",
            JSON.stringify(reports)
        );

    }, 3000);
}
function viewTaskLocation(){
    window.open(
        "https://www.google.com/maps/search/?api=1&query=CGC+University+Mohali+Jhanjeri",
        "_blank"
    );
}
function loadStaffTask() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const taskCard = document.getElementById("staffTask");

    if (!taskCard) {
        return;
    }

    let tasks = reports.filter(function(report) {

        return report.assignedStaff === "Staff 02" &&
               report.status === "In Progress";

    });

    if (tasks.length === 0) {

        taskCard.innerHTML = `
            <div class="no-task">
                <h3>🎉 No Cleaning Task</h3>
                <p>Abhi koi cleaning task assigned nahi hai.</p>
            </div>
        `;

        return;
    }

    taskCard.innerHTML = "";

    tasks.forEach(function(task, taskNumber) {

        let index = reports.indexOf(task);

        taskCard.innerHTML += `

            <div class="staff-task-item">

                <div class="task-top">

                    <h3>
                        Task #${taskNumber + 1}
                    </h3>

                    <span class="priority high">
                        Cleaning Required
                    </span>

                </div>

                <p>
                    <strong>🗑️ Problem:</strong><br>
                    ${task.problem || task.description || "Garbage"}
                </p>

                <p>
                    <strong>📍 Location:</strong><br>
                    ${task.location}
                </p>

                <p>
                    <strong>🕐 Reported:</strong><br>
                    ${task.date}
                </p>

                <div class="before-photo">

                    <h4>📷 Student Report Photo</h4>

                    ${
                        task.photo
                        ?
                        `<img src="${task.photo}" alt="Student Report Photo">`
                        :
                        `<p>No photo available.</p>`
                    }

                </div>

                <p>
                    <strong>🧹 Please clean the area.</strong>
                </p>

                <button
                    type="button"
                    onclick="viewTaskLocation()">
                    📍 Open Location
                </button>

                <label>
                    📷 Upload After-Cleaning Photo
                </label>

                <input
                    type="file"
                    id="afterPhoto-${index}"
                    accept="image/*"
                >

                <button
                    type="button"
                    onclick="completeCleaning(${index})">
                    ✅ Kaam Complete
                </button>

            </div>
        `;
    });
}
if(document.getElementById("staffTask")){
    loadStaffTask();
}
if(document.getElementById("studentReportPhoto")){
    loadStaffTask();
}
function loadMyComplaints() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const complaintsList = document.getElementById("complaintsList");

    if (!complaintsList) {
        return;
    }

    if (reports.length === 0) {
        complaintsList.innerHTML = `
            <div class="no-complaints">
                <h3>No Complaints Yet</h3>
                <p>You have not submitted any cleanliness report.</p>
            </div>
        `;
        return;
    }

    complaintsList.innerHTML = "";

    reports.forEach(function(report, index) {

        complaintsList.innerHTML += `
            <div class="complaint-card">

                <div class="complaint-top">
                    <h3>Report #${index + 1}</h3>
                    <span class="complaint-status ${report.status.toLowerCase().replace(" ", "-")}">
                        ${report.status}
                    </span>
                </div>

                <p>
                    <strong>📍 Location:</strong>
                    ${report.location}
                </p>

                <p>
                    <strong>📝 Problem:</strong>
                    ${report.description}
                </p>

                <p>
                    <strong>🕐 Submitted:</strong>
                    ${report.date}
                </p>

            </div>
        `;
    });
}
if (document.getElementById("complaintsList")) {
    loadMyComplaints();
}
function loadComplaintStatus() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const statusList = document.getElementById("statusList");

    if (!statusList) {
        return;
    }

    if (reports.length === 0) {
        statusList.innerHTML = `
            <div class="no-status">
                <h3>No Complaints Found</h3>
                <p>Submit a cleanliness report to track its progress.</p>
            </div>
        `;
        return;
    }

    statusList.innerHTML = "";

    reports.forEach(function(report, index) {

        let submitted = true;
        let assigned = report.assignedStaff||
                       report.status === "In Progress" ||
                       report.status === "Verification Pending" ||
                       report.status === "Resolved";
        let cleaning = report.status === "In Progress"||
                       report.status === "Verification Pending"||
                       report.status === "Resolved";
        let verification = report.status === "Verification Pending" ||
                           report.status === "Resolved";
        let resolved = report.status === "Resolved";

        statusList.innerHTML += `
            <div class="status-card">

                <div class="status-header">
                    <h3>Report #${index + 1}</h3>
                    <span class="status-badge">
                        ${report.status}
                    </span>
                </div>

                <p><strong>Problem:</strong> ${report.description}</p>

                <p><strong>Location:</strong> ${report.location}</p>

                <div class="progress">

                    <div class="progress-step ${submitted ? "active" : ""}">
                        <span>✓</span>
                        <p>Report Submitted</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${assigned ? "active" : ""}">
                        <span>${assigned ? "✓" : "○"}</span>
                        <p>Staff Assigned</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${cleaning ? "active" : ""}">
                        <span>${cleaning ? "✓" : "○"}</span>
                        <p>Cleaning</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${verification ? "active" : ""}">
                        <span>${verification ? "✓" : "○"}</span>
                        <p>AI Verification</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${resolved ? "active" : ""}">
                        <span>${resolved ? "✓" : "○"}</span>
                        <p>Resolved</p>
                    </div>

                </div>

            </div>
        `;
    });
}
if(document.getElementById("statusList")) {
    loadComplaintStatus();
}
function submitRecycleRequest() {

    const type = Array.from(
    document.querySelectorAll('.waste-options input[type="checkbox"]:checked')).map(function(checkbox) {
    return checkbox.value;
});
    const photo = document.getElementById("recyclePhoto").files[0];
    const location = document.getElementById("recycleLocation").value;
    const description = document.getElementById("recycleDescription").value;

    if (type.length=== 0 || !photo || location === "" || description === "") {
        alert("ERROR: Please fill all details");
        return;
    }

    let requests = JSON.parse(localStorage.getItem("recycleRequests")) || [];

  requests.push({
    id: Date.now(),

    studentGR: JSON.parse(
        localStorage.getItem("loggedInStudent")
    ).grNumber,

    type: type,
    photo: photo.name,
    location: location,
    description: description,
    status: "Pending",
    date: new Date().toLocaleString()
});

    localStorage.setItem("recycleRequests", JSON.stringify(requests));

    alert("Recycle Request Submitted Successfully!");

    window.location.href = "student-dashboard.html";
}
function updateRecycleRequestCount() {

    let requests = JSON.parse(localStorage.getItem("recycleRequests")) || [];

    let acceptedRequests = requests.filter(function(request) {
        return request.status === "Accepted";
    });

    document.getElementById("acceptedRecycleRequests").textContent =
        acceptedRequests.length;
}
if(document.getElementById("acceptedRecycleRequests")){
    updateRecycleRequestCount();
}
function loadRecycleRequests() {

    let requests = JSON.parse(localStorage.getItem("recycleRequests")) || [];

    const requestsList = document.getElementById("recycleRequestsList");

    if (!requestsList) {
        return;
    }

    if (requests.length === 0) {
        requestsList.innerHTML = "<p>No recycle requests yet.</p>";
        return;
    }

    requestsList.innerHTML = "";

    requests.forEach(function(request, index) {

        requestsList.innerHTML += `
            <div class="admin-report-card">

                <div class="admin-report-top">
                    <h3>Recycle Request #${index + 1}</h3>

                    <span class="report-status ${request.status.toLowerCase()}">
                        ${request.status}
                    </span>
                </div>

                <p>
                    <strong>♻️ Waste Type:</strong>
                    ${request.type}
                </p>

                <p>
                    <strong>📍 Location:</strong>
                    ${request.location}
                </p>

                <p>
                    <strong>📝 Description:</strong>
                    ${request.description}
                </p>

                <p>
                    <strong>🕐 Requested:</strong>
                    ${request.date}
                </p>

               ${
    request.status === "Pending"
    ? `
        <div class="recycle-approval">

            <input
                type="number"
                id="recyclePoints-${index}"
                placeholder="Enter Points"
                min="1"
            >

            <button
                type="button"
                onclick="acceptRecycleRequest(${index})">
                ✅ Accept & Award Points
            </button>

        </div>
      `
    : `
        <p class="points-awarded">
            🏆 Points Awarded:
            <strong>${request.points || 0}</strong>
        </p>
      `
}

            </div>
        `;
    });
}
function acceptRecycleRequest(index) {

    let requests =
        JSON.parse(localStorage.getItem("recycleRequests")) || [];

    if (!requests[index]) {
        alert("Recycle Request not found");
        return;
    }

    const pointsInput =
        document.getElementById("recyclePoints-" + index);

    if (!pointsInput) {
        alert("Points field not found");
        return;
    }

    let points = Number(pointsInput.value);

    if (!points || points <= 0) {
        alert("Please enter valid points.");
        return;
    }

    requests[index].status = "Accepted";
    requests[index].points = points;
    requests[index].pointsAwarded = true;

    let studentGR = requests[index].studentGR;

    if (studentGR) {

        addStudentPoints(
            studentGR,
            points
        );

    } else {

        alert(
            "Student information not found. " +
            "This request cannot receive points."
        );

        return;
    }

    localStorage.setItem(
        "recycleRequests",
        JSON.stringify(requests)
    );

    alert(
        "Recycle Request Accepted!\n\n" +
        points +
        " points awarded to the student."
    );

    loadRecycleRequests();
    updateRecycleRequestCount();
}
if(document.getElementById("recycleRequestsList")){
    loadRecycleRequests();
}
function loadRecentReports() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const recentReportsList = document.getElementById("recentReportsList");

    if (!recentReportsList) {
        return;
    }

    if (reports.length === 0) {
        recentReportsList.innerHTML = `
            <div class="report-item">
                <p>No reports submitted yet.</p>
            </div>
        `;
        return;
    }

    let latestReport = reports[reports.length - 1];

    let statusClass = latestReport.status
        .toLowerCase()
        .replace(" ", "-");

    recentReportsList.innerHTML = `
        <div class="report-item">

            <div>
                <h3>${latestReport.description}</h3>
                <p>${latestReport.date}</p>
            </div>

            <span class="status ${statusClass}">
                ${latestReport.status}
            </span>

        </div>
    `;
}
if(document.getElementById("recentReportsList")){
    loadRecentReports();
}
function getCurrentStudent() {

    let loggedInStudent =
        JSON.parse(localStorage.getItem("loggedInStudent"));

    if (loggedInStudent) {
        return loggedInStudent;
    }

    return null;
}



function getStudentPoints() {

    let student = getCurrentStudent();

    if (!student) {
        return 0;
    }

    let pointsData =
        JSON.parse(localStorage.getItem("studentPoints")) || {};

    return pointsData[student.grNumber] || 0;
}


function addStudentPoints(grNumber, points) {

    let pointsData =
        JSON.parse(localStorage.getItem("studentPoints")) || {};

    if (!pointsData[grNumber]) {
        pointsData[grNumber] = 0;
    }

    pointsData[grNumber] += points;

    localStorage.setItem(
        "studentPoints",
        JSON.stringify(pointsData)
    );
}


function updateStudentStreak() {

    let student = getCurrentStudent();

    if (!student) {
        return;
    }

    let streakData =
        JSON.parse(localStorage.getItem("studentStreak")) || {};

    let today = new Date().toDateString();

    if (!streakData[student.grNumber]) {

        streakData[student.grNumber] = {
            streak: 1,
            lastDate: today
        };

    } else {

        let lastDate =
            streakData[student.grNumber].lastDate;

        if (lastDate !== today) {

            let last = new Date(lastDate);
            let now = new Date();

            let difference =
                Math.floor(
                    (now - last) / (1000 * 60 * 60 * 24)
                );

            if (difference === 1) {

                streakData[student.grNumber].streak += 1;

            } else {

                streakData[student.grNumber].streak = 1;

            }

            streakData[student.grNumber].lastDate = today;
        }
    }

    localStorage.setItem(
        "studentStreak",
        JSON.stringify(streakData)
    );
}


function getStudentStreak() {

    let student = getCurrentStudent();

    if (!student) {
        return 0;
    }

    let streakData =
        JSON.parse(localStorage.getItem("studentStreak")) || {};

    if (!streakData[student.grNumber]) {
        return 0;
    }

    return streakData[student.grNumber].streak;
}



function updateStudentRewardDisplay() {

    let pointsElement =
        document.getElementById("studentPoints");

    let streakElement =
        document.getElementById("studentStreak");

    if (pointsElement) {
        pointsElement.textContent =
            getStudentPoints();
    }

    if (streakElement) {
        streakElement.textContent =
            getStudentStreak();
    }
}



if (document.getElementById("studentPoints")) {

    updateStudentStreak();
    updateStudentRewardDisplay();

}
function loadStudentProfile() {

    let student = getCurrentStudent();

    if (!student) {
        return;
    }


    const nameElement =
        document.getElementById("profileName");

    if (nameElement) {
        nameElement.textContent = student.name;
    }


    const grElement =
        document.getElementById("profileGR");

    if (grElement) {
        grElement.textContent =
            "GR Number: " + student.grNumber;
    }



    const pointsElement =
        document.getElementById("profilePoints");

    if (pointsElement) {
        pointsElement.textContent =
            getStudentPoints();
    }



    const streakElement =
        document.getElementById("profileStreak");

    if (streakElement) {
        streakElement.textContent =
            getStudentStreak();
    }



    loadLeaderboard();
}



async function loadLeaderboard() {

    const leaderboardList =
        document.getElementById("leaderboardList");

    if (!leaderboardList) {
        return;
    }

    try {

        const response = await fetch(
            "https://ic-clean-campus.onrender.com/students/leaderboard"
        );

        if (!response.ok) {
            throw new Error("Leaderboard API failed");
        }

        const students = await response.json();

        leaderboardList.innerHTML = "";

        if (students.length === 0) {

            leaderboardList.innerHTML =
                "<p>No students found.</p>";

            return;
        }

        const currentUser =
            JSON.parse(localStorage.getItem("loggedInUser"));

        const currentStudent =
            currentUser && currentUser.role === "student"
                ? currentUser
                : null;


        students.forEach(function(student, index) {

            const isCurrentStudent =
                currentStudent &&
                student.gr_number === currentStudent.gr_number;


            const rank = index + 1;

            let rankDisplay = rank;

            if (rank === 1) {
                rankDisplay = "🥇";
            }
            else if (rank === 2) {
                rankDisplay = "🥈";
            }
            else if (rank === 3) {
                rankDisplay = "🥉";
            }


            leaderboardList.innerHTML += `
                <div class="leaderboard-item ${isCurrentStudent ? "you" : ""}">

                    <div class="leaderboard-left">

                        <span class="leaderboard-rank">
                            ${rankDisplay}
                        </span>

                        <span class="leaderboard-name">
                            ${student.name}
                            ${isCurrentStudent ? " (You)" : ""}
                        </span>

                    </div>

                    <span class="leaderboard-points">
                        🏆 ${student.points} pts
                    </span>

                </div>
            `;


            if (isCurrentStudent) {

                const rankElement =
                    document.getElementById("profileRank");

                if (rankElement) {
                    rankElement.textContent = "#" + rank;
                }

            }

        });

    }
    catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );

        leaderboardList.innerHTML =
            "<p>Unable to load leaderboard.</p>";
    }
}


function getPointsForStudent(grNumber) {

    let pointsData =
        JSON.parse(localStorage.getItem("studentPoints")) || {};

    return pointsData[grNumber] || 0;
}



if (document.getElementById("profileName")) {

    updateStudentStreak();
    loadStudentProfile();

}

function loadAchievements() {

    const achievementList =
        document.getElementById("achievementList");

    if (!achievementList) {
        return;
    }

    let student = getCurrentStudent();

    if (!student) {
        return;
    }

    let reports =
        JSON.parse(localStorage.getItem("report")) || [];

    let recycleRequests =
        JSON.parse(
            localStorage.getItem("recycleRequests")
        ) || [];

    let studentReports =
        reports.filter(function(report) {
            return report.studentGR === student.grNumber;
        });

    let studentRecycleRequests =
        recycleRequests.filter(function(request) {
            return request.studentGR === student.grNumber;
        });



    let reporterUnlocked =
        studentReports.length > 0;



    let recyclerUnlocked =
        studentRecycleRequests.some(function(request) {
            return request.status === "Accepted";
        });



    let streakUnlocked =
        getStudentStreak() >= 7;


    achievementList.innerHTML = `

        <div class="achievement-card ${
            reporterUnlocked ? "unlocked" : "locked"
        }">

            <span>🗑️</span>

            <div>
                <h3>Clean Campus Reporter</h3>

                <p>
                    Submit your first garbage report.
                </p>

                <strong>
                    ${
                        reporterUnlocked
                        ? "✅ Unlocked"
                        : "🔒 Locked"
                    }
                </strong>
            </div>

        </div>


        <div class="achievement-card ${
            recyclerUnlocked ? "unlocked" : "locked"
        }">

            <span>♻️</span>

            <div>
                <h3>Eco Recycler</h3>

                <p>
                    Complete your first recycle request.
                </p>

                <strong>
                    ${
                        recyclerUnlocked
                        ? "✅ Unlocked"
                        : "🔒 Locked"
                    }
                </strong>
            </div>

        </div>


        <div class="achievement-card ${
            streakUnlocked ? "unlocked" : "locked"
        }">

            <span>🔥</span>

            <div>
                <h3>Streak Champion</h3>

                <p>
                    Maintain a 7-day activity streak.
                </p>

                <strong>
                    ${
                        streakUnlocked
                        ? "✅ Unlocked"
                        : "🔒 Locked"
                    }
                </strong>
            </div>

        </div>

    `;
}



if (document.getElementById("achievementList")) {
    loadAchievements();
}
function showAddAdmin() {
    document.getElementById("adminModal").style.display = "flex";
}

function showAddStaff() {
    document.getElementById("staffModal").style.display = "flex";
}

function closeAdminModal() {
    document.getElementById("adminModal").style.display = "none";
}
function closeStaffModal() {
    document.getElementById("staffModal").style.display = "none";
}

async function addAdmin() {
    const name = document.getElementById("newAdminName").value.trim();
    const loginId = document.getElementById("newAdminID").value.trim();
    const password = document.getElementById("newAdminPassword").value;
    const area = document.getElementById("newAdminArea").value.trim();

    if (!name || !loginId || !password || !area) {
        alert("Please fill all fields");
        return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            "https://ic-clean-campus.onrender.com/main-admin/add-user",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: name,
                    login_id: loginId,
                    password: password,
                    role: "admin",
                    area: area
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Failed to create admin");
            return;
        }

        alert("Admin created successfully!");

        document.getElementById("newAdminName").value = "";
        document.getElementById("newAdminID").value = "";
        document.getElementById("newAdminPassword").value = "";
        document.getElementById("newAdminArea").value = "";

        closeAdminModal();

    } catch (error) {
        console.error("Add admin error:", error);
        alert("Backend connection failed");
    }
}

async function addStaff() {
    const name = document.getElementById("newStaffName").value.trim();
    const loginId = document.getElementById("newStaffID").value.trim();
    const password = document.getElementById("newStaffPassword").value;
    const area = document.getElementById("newStaffArea").value.trim();

    if (!name || !loginId || !password || !area) {
        alert("Please fill all fields");
        return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            "https://ic-clean-campus.onrender.com/main-admin/add-user",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: name,
                    login_id: loginId,
                    password: password,
                    role: "staff",
                    area: area
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Failed to create staff");
            return;
        }

        alert("Staff created successfully!");

        document.getElementById("newStaffName").value = "";
        document.getElementById("newStaffID").value = "";
        document.getElementById("newStaffPassword").value = "";
        document.getElementById("newStaffArea").value = "";

        closeStaffModal();

    } catch (error) {
        console.error("Add staff error:", error);
        alert("Backend connection failed");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        return;
    }

    const adminName = document.getElementById("adminName");
    const adminLoginId = document.getElementById("adminLoginId");
    const adminArea = document.getElementById("adminArea");

    if (adminName) {
        adminName.textContent = user.name || "Admin";
        adminLoginId.textContent = user.login_id || "-";
        adminArea.textContent = user.area || "-";
    }

    const staffName = document.getElementById("staffName");
    const staffLoginId = document.getElementById("staffLoginId");
    const staffArea = document.getElementById("staffArea");

    if (staffName) {
        staffName.textContent = user.name || "Staff";
        staffLoginId.textContent = user.login_id || "-";
        staffArea.textContent = user.area || "-";
    }

    const staffGreetingName = document.getElementById("staffGreetingName");
    if (staffGreetingName) {
        staffGreetingName.textContent = user.name || "Staff";
    }

});
let mainAdminOverview = null;


async function loadMainAdminOverview() {

    const accessToken =
        localStorage.getItem("accessToken");

    if (!accessToken) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            "https://ic-clean-campus.onrender.com/main-admin/overview",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to load dashboard data."
            );

            return;
        }

        mainAdminOverview = data;

        document.getElementById(
            "totalStudents"
        ).textContent = data.counts.students;

        document.getElementById(
            "totalAdmins"
        ).textContent = data.counts.admins;

        document.getElementById(
            "totalStaff"
        ).textContent = data.counts.staff;

        document.getElementById(
            "totalReports"
        ).textContent = data.counts.reports;

    } catch (error) {

        console.error(
            "Main Admin overview error:",
            error
        );

        alert(
            "Unable to connect to backend."
        );
    }
}


function openUserList(type) {

    if (!mainAdminOverview) {
        alert("Dashboard data is still loading.");
        return;
    }

    const modal =
        document.getElementById("userListModal");

    const title =
        document.getElementById("userListTitle");

    const subtitle =
        document.getElementById("userListSubtitle");

    const content =
        document.getElementById("userListContent");


    let users = [];

    if (type === "students") {

        users = mainAdminOverview.students;

        title.textContent = "All Students";

        subtitle.textContent =
            `${users.length} students registered in the system`;

    }

    else if (type === "admins") {

        users = mainAdminOverview.admins;

        title.textContent = "All Admins";

        subtitle.textContent =
            `${users.length} area admins registered in the system`;

    }

    else if (type === "staff") {

        users = mainAdminOverview.staff;

        title.textContent = "All Staff";

        subtitle.textContent =
            `${users.length} staff members registered in the system`;

    }


    if (users.length === 0) {

        content.innerHTML = `
            <div class="empty-user-list">
                <h3>No users found</h3>
                <p>There are currently no users in this category.</p>
            </div>
        `;

        modal.style.display = "flex";

        return;
    }


    content.innerHTML = users.map(function(user) {

        const grHTML =
            user.gr_number
                ? `<p><strong>GR Number:</strong> ${escapeHTML(user.gr_number)}</p>`
                : "";

        const areaHTML =
            user.area
                ? `<p><strong>Area:</strong> ${escapeHTML(user.area)}</p>`
                : "";

        return `
            <div class="user-detail-card">

                <div class="user-detail-main">

                    <div class="user-avatar">
                        ${escapeHTML(
                            user.name
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="user-detail-info">

                        <h3>
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            <strong>Login ID:</strong>
                            ${escapeHTML(user.login_id)}
                        </p>

                        ${grHTML}

                        <p>
                            <strong>Role:</strong>
                            ${escapeHTML(user.role)}
                        </p>

                        ${areaHTML}

                        <p>
                            <strong>Password:</strong>
                            <span class="hidden-password">
                                ••••••••
                            </span>
                        </p>

                    </div>

                </div>

                <button
                    class="reset-password-button"
                    onclick="resetUserPassword(${user.id}, '${escapeJS(user.name)}')"
                >
                    Reset Password
                </button>

            </div>
        `;

    }).join("");

    modal.style.display = "flex";
}


function closeUserList() {

    const modal =
        document.getElementById("userListModal");

    modal.style.display = "none";
}


async function resetUserPassword(userId, userName) {

    const newPassword = prompt(
        `Enter a new password for ${userName}:`
    );

    if (newPassword === null) {
        return;
    }

    if (newPassword.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;
    }

    const accessToken =
        localStorage.getItem("accessToken");

    if (!accessToken) {

        alert(
            "Session expired. Please login again."
        );

        window.location.href = "login.html";

        return;
    }


    try {

        const response = await fetch(

            `https://ic-clean-campus.onrender.com/main-admin/users/${userId}/reset-password`,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },

                body: JSON.stringify({
                    new_password: newPassword
                })
            }

        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Password reset failed."
            );

            return;
        }


        alert(
            "Password reset successfully."
        );

    }

    catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        alert(
            "Backend connection failed."
        );
    }
}


function openReportList() {

    alert(
        "Report management will be connected to the live reports system next."
    );
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeJS(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");
}


if (
    document.getElementById(
        "main-admin-dashboard"
    )
) {

    loadMainAdminOverview();

}