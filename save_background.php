<?php
// تحديد معلمات الاتصال بقاعدة البيانات
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_mode";

// إنشاء اتصال بقاعدة البيانات
$conn = new mysqli($servername, $username, $password, $dbname);

// التحقق من الاتصال
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        login();
        break;
    case 'save_project':
        save_project();
        break;
    case 'get_projects':
        get_projects();
        break;
    case 'save_user_info':
        save_user_info();
        break;
    case 'get_user_info':
        get_user_info();
        break;
    case 'save_contact_info':
        save_contact_info();
        break;
    case 'get_contact_info':
        get_contact_info();
        break;
    case 'save_background':
        save_background();
        break;
    case 'get_background':
        get_background();
        break;
    default:
        echo json_encode(["status" => "invalid_action"]);
        break;
}

$conn->close();

function login() {
    global $conn;
    $username = $_POST['username'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users WHERE username=? AND password=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failure"]);
    }

    $stmt->close();
}

function save_project() {
    global $conn;
    $title = $_POST['title'];
    $description = $_POST['description'];
    $youtubeLink = $_POST['youtubeLink'];
    $date = date('Y-m-d H:i:s');

    $sql = "INSERT INTO projects (title, description, youtubeLink, date) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $title, $description, $youtubeLink, $date);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failure"]);
    }

    $stmt->close();
}

function get_projects() {
    global $conn;
    $sql = "SELECT * FROM projects ORDER BY date DESC";
    $result = $conn->query($sql);

    $projects = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
    }

    echo json_encode($projects);
}

function save_user_info() {
    global $conn;
    $aboutText = $_POST['aboutText'];
    $birthday = $_POST['birthday'];
    $phone = $_POST['phone'];
    $city = $_POST['city'];
    $ladderArrangement = $_POST['ladderArrangement'];
    $age = $_POST['age'];
    $AboutEmail = $_POST['AboutEmail'];
    $freelance = $_POST['freelance'];
    $jobTitle = $_POST['jobTitle'];
    $imageSrc = $_POST['imageSrc'];

    $sql = "INSERT INTO user_info (aboutText, birthday, phone, city, ladderArrangement, age, AboutEmail, freelance, jobTitle, imageSrc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssssss", $aboutText, $birthday, $phone, $city, $ladderArrangement, $age, $AboutEmail, $freelance, $jobTitle, $imageSrc);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failure"]);
    }

    $stmt->close();
}

function get_user_info() {
    global $conn;
    $sql = "SELECT * FROM user_info LIMIT 1";
    $result = $conn->query($sql);

    $userInfo = [];
    if ($result->num_rows > 0) {
        $userInfo = $result->fetch_assoc();
    }

    echo json_encode($userInfo);
}

function save_contact_info() {
    global $conn;
    $display_phone = $_POST['display_phone'];
    $display_address = $_POST['display_address'];
    $display_email = $_POST['display_email'];
    $social_email = $_POST['social_email'];
    $social_facebook = $_POST['social_facebook'];
    $social_instagram = $_POST['social_instagram'];
    $social_github = $_POST['social_github'];
    $form_action = $_POST['form_action'];

    $sql = "INSERT INTO contact_info (display_phone, display_address, display_email, social_email, social_facebook, social_instagram, social_github, form_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssss", $display_phone, $display_address, $display_email, $social_email, $social_facebook, $social_instagram, $social_github, $form_action);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failure"]);
    }

    $stmt->close();
}

function get_contact_info() {
    global $conn;
    $sql = "SELECT * FROM contact_info LIMIT 1";
    $result = $conn->query($sql);

    $contactInfo = [];
    if ($result->num_rows > 0) {
        $contactInfo = $result->fetch_assoc();
    }

    echo json_encode($contactInfo);
}

function save_background() {
    global $conn;
    $backgroundImageUrl = $_POST['backgroundImageUrl'];

    $sql = "INSERT INTO contact_info (backgroundImageUrl) VALUES (?) ON DUPLICATE KEY UPDATE backgroundImageUrl=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $backgroundImageUrl, $backgroundImageUrl);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failure"]);
    }

    $stmt->close();
}

function get_background() {
    global $conn;
    $sql = "SELECT backgroundImageUrl FROM contact_info LIMIT 1";
    $result = $conn->query($sql);

    $backgroundImageUrl = '';
    if ($result->num_rows > 0) {
        $backgroundImageUrl = $result->fetch_assoc()['backgroundImageUrl'];
    }

    echo json_encode($backgroundImageUrl);
}
?>
