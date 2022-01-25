<?php

$conn = new PDO('mysql:host=localhost;dbname=client_side;charset=utf8', 'root', '', [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$name = $_POST['name'] ?? null;
$time = $_POST['time'] ?? null;
$stars = $_POST['stars'] ?? null;

if (empty($name)) {
    echo json_encode(['error' => 'Name field cannot be blank.']);
    return false;
}

if (empty($time) && $time != '0') {
    echo json_encode(['error' => 'Time field cannot be blank.']);
    return false;
}

if (empty($stars) && $stars != '0') {
    echo json_encode(['error' => 'Stars field cannot be blank.']);
    return false;
}

if (!ctype_digit($time)) {
    echo json_encode(['error' => 'Time field must be an integer.']);
    return false;
}


if (!ctype_digit($stars)) {
    echo json_encode(['error' => 'Stars field must be an integer.']);
    return false;
}

$stmtInsert = $conn->prepare('INSERT INTO ranking (name, time, stars) VALUES (?, ?, ?)');
$stmtInsert->execute([$name, $time, $stars]);

$stmtSelect = $conn->query('SELECT * FROM ranking');
$ranking = $stmtSelect->fetchAll();
echo json_encode($ranking);