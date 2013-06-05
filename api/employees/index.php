<?php

// DB connection
$db = mysqli_connect("localhost","root","root","bbdir");
if (mysqli_connect_errno($db)) {
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
	exit();
}

$results = array();

$res = $db->query("SELECT id, first_name, last_name FROM `users` ORDER BY last_name");
$res->data_seek(0);
while ($row = $res->fetch_assoc()) {
	$results[] = $row;
}

// DB CLOSE
mysqli_close($db);

header('Content-type: application/json');
exit(json_encode($results, JSON_UNESCAPED_SLASHES));


?>