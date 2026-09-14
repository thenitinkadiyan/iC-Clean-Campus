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

function login(){
        const id = document.querySelector('.login-box input[type="text"]').value;
        const password = document.querySelector('.login-box input[type="password"]').value;
    if(id===""||password===""){
        alert("ERROR: Please enter both ID and Password");
        return;
    }
    if(id===adminID1 && password===adminPassword1){
        window.location.href = "admin-dashboard.html";
        return;
    }
    if(id===adminID2 && password===adminPassword2){
        window.location.href = "admin-dashboard.html";
        return;
    }
    if(id===staffID1 && password===staffPassword1){
        window.location.href = "staff-dashboard.html";
        return;
    }
    if(id===studentID1 && password===studentPassword1){
        localStorage.setItem("loggedInStudent",JSON.stringify({
            name:"Tanisha",grNumber:studentID1
        })
        );
        window.location.href = "student-dashboard.html";
        return;
    }
    if(id===studentID2 && password===studentPassword2){
         localStorage.setItem("loggedInStudent",JSON.stringify({
            name:"Gurpreet",grNumber:studentID2
        })
        );
        window.location.href = "student-dashboard.html";
        return;
    }
    if(id===studentID3 && password===studentPassword3){
         localStorage.setItem("loggedInStudent",JSON.stringify({
            name:"Charu",grNumber:studentID3
        })
        );
        window.location.href = "student-dashboard.html";
        return;
    }
    let students=JSON.parse(localStorage.getItem("students"))||[];
    let student=students.find(function(s){
        return s.grNumber===id && s.password===password;
    });
    if(student){
         localStorage.setItem("loggedInStudent",JSON.stringify({
            name:student.name,grNumber:student.grNumber
        })
        );
        window.location.href="student-dashboard.html";
        return;
    }
    alert("ERROR: Invalid ID or Password");
}
function registerStudent(){
        const name= document.getElementById("studentName").value;
        const grNumber= document.getElementById("studentGR").value;
        const password= document.getElementById("studentPassword").value;
        const confirmPassword= document.getElementById("confirmPassword").value;
        if(name===""||grNumber===""||password===""||confirmPassword===""){
            alert("ERROR: Please fill all Fields");
            return;
        }
        if(password !==confirmPassword){
            alert("ERROR:Passwords do not match");
            return;
        }
    let students=JSON.parse(localStorage.getItem("students"))||[];
    students.push({
        name:name,
        grNumber:grNumber,
        password:password
    });
    localStorage.setItem("students",JSON.stringify(students));
    alert("Registration Successfull!");
    
    window.location.href="login.html";
}
let map;
let marker;

function initMap() {
    map = L.map('map').setView([30.7046, 76.7179], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
setTimeout(function(){
    map.invalidateSize();
},300);
    map.on('click', function(e) {
        setLocation(e.latlng.lat, e.latlng.lng);
    });
}

function setLocation(lat, lng) {

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lng]).addTo(map);

    document.getElementById("locationText").value =
        lat.toFixed(6) + ", " + lng.toFixed(6);
}

function getCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Location is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 17);
            setLocation(lat, lng);
        },
        function() {
            alert("Unable to get your current location.");
        }
    );
}
function submitReport() {

    const photo = document.getElementById("garbagePhoto").files[0];
    const problem = document.getElementById("problem").value;
    const location = document.getElementById("locationText").value;

    if (!photo || problem === "" || location === "") {
        alert("ERROR: Please fill all details");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        let reports = JSON.parse(localStorage.getItem("report")) || [];

       reports.push({
    id: Date.now(),

    studentGR: JSON.parse(
        localStorage.getItem("loggedInStudent")
    ).grNumber,

    problem: problem,
    location: location,
    photo: event.target.result,
    status: "In Progress",
    assignedStaff: "Staff 02",
    date: new Date().toLocaleString()
});

        localStorage.setItem("report", JSON.stringify(reports));

        alert(
            "Report Submitted Successfully!\n\n" +
            "Staff 02 has been assigned automatically."
        );

        window.location.href = "student-dashboard.html";
    };

    reader.readAsDataURL(photo);
}
function updateReportCount(){
    let report= JSON.parse(localStorage.getItem("report"))||[];
    document.getElementById("reportCount").textContent=report.Length;
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
                    ? `<button onclick="acceptRecycleRequest(${index})">
                        ✅ Accept Request
                       </button>`
                    : ""
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

    let points = prompt(
        "Enter points to award for this recycle request:"
    );

    if (points === null) {
        return;
    }

    points = Number(points);

    if (isNaN(points) || points <= 0) {
        alert("Please enter a valid points number.");
        return;
    }

    requests[index].status = "Accepted";
    requests[index].points = points;
    requests[index].pointsAwarded = false;

    localStorage.setItem(
        "recycleRequests",
        JSON.stringify(requests)
    );


    let studentGR = requests[index].studentGR;

    if (studentGR && !requests[index].pointsAwarded) {

        addStudentPoints(
            studentGR,
            points
        );

        requests[index].pointsAwarded = true;

        localStorage.setItem(
            "recycleRequests",
            JSON.stringify(requests)
        );
    }

    alert(
        "Recycle Request Accepted!\n\n" +
        points + " points awarded to the student."
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



function loadLeaderboard() {

    const leaderboardList =
        document.getElementById("leaderboardList");

    if (!leaderboardList) {
        return;
    }

    let students = [];


    let registeredStudents =
        JSON.parse(localStorage.getItem("students")) || [];

    registeredStudents.forEach(function(student) {

        students.push({
            name: student.name,
            grNumber: student.grNumber,
            points: getPointsForStudent(student.grNumber)
        });

    });



    const fixedStudents = [
        {
            name: "Tanisha",
            grNumber: studentID1
        },
        {
            name: "Gurpreet",
            grNumber: studentID2
        },
        {
            name: "Charu",
            grNumber: studentID3
        }
    ];


    fixedStudents.forEach(function(student) {

        let alreadyExists =
            students.some(function(existingStudent) {
                return existingStudent.grNumber === student.grNumber;
            });

        if (!alreadyExists) {

            students.push({
                name: student.name,
                grNumber: student.grNumber,
                points: getPointsForStudent(student.grNumber)
            });

        }

    });



    students.sort(function(a, b) {
        return b.points - a.points;
    });


    leaderboardList.innerHTML = "";


    if (students.length === 0) {

        leaderboardList.innerHTML =
            "<p>No students found.</p>";

        return;
    }



    let currentStudent =
        getCurrentStudent();


    students.forEach(function(student, index) {

        let isCurrentStudent =
            currentStudent &&
            student.grNumber === currentStudent.grNumber;


        let rank = index + 1;

        let rankDisplay = rank;

        if (rank === 1) {
            rankDisplay = "🥇";
        } else if (rank === 2) {
            rankDisplay = "🥈";
        } else if (rank === 3) {
            rankDisplay = "🥉";
        }


        leaderboardList.innerHTML += `

            <div class="leaderboard-item ${
                isCurrentStudent ? "you" : ""
            }">

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
                rankElement.textContent =
                    "#" + rank;
            }

        }

    });

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