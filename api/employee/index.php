<?php

if(empty($_GET['id'])) {
	header('HTTP/1.0 400 Bad Request');
	exit();
}

if($_SERVER['REQUEST_METHOD'] == 'PUT') {
	$body = file_get_contents("php://input");
	$body_params = json_decode($body);
	$errors = array();
	$fields = array('first_name','last_name','JobTitle','InternetAddress','CompanyName','Department','id');
	if($body_params) {
	    foreach($body_params as $param_name => $param_value) {
	    	if(in_array($param_name, $fields) && empty($param_value)) {
	    		array_push($errors, array($param_name=>$param_name . " is required."));
	    	}
	        $parameters[$param_name] = $param_value;
	    }
	}
	if(!empty($errors)) {
		$errors = json_encode($errors, JSON_UNESCAPED_SLASHES);
		header('HTTP/1.0 400 Bad Request', true, 400);
		header('Content-type: application/json');
		exit($errors);
	}
	exit;
}


// DB connection
$db = mysqli_connect("localhost","root","root","bbdir");
if (mysqli_connect_errno($db)) {
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
	exit();
}

$results = array();
$res = $db->query("SELECT * FROM `users` WHERE `id` = " . $_GET['id']);
$res->data_seek(0);
if($res->num_rows < 1) {
	header('HTTP/1.0 404 Not Found');
	exit();
}
$person = $res->fetch_assoc();
if(!empty($person['json'])) {
	// DB CLOSE
	mysqli_close($db);
	header('Content-type: application/json');
	exit($person['json']);
}

//GET DIR PAGE
$curl = curl_init(); 
curl_setopt($curl, CURLOPT_URL, $person['link']); 
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1); 
$output = curl_exec($curl); 
curl_close($curl);

//PARSE HTML
$matches = null;

//All Props
preg_match_all('/<input name="(.*)" type="hidden" value="(.*)">/U',$output,$matches);
$user_props = array_combine($matches[1], $matches[2]);

//Name
preg_match_all('/<title>Person record for: (.*) (.*)\//U',$output,$matches);
$user_props['first_name'] = $matches[1][0];
$user_props['last_name'] = $matches[2][0];

//Image
preg_match_all('/<hr><img src=(.*)>/U',$output,$matches);
$user_props['employee_photo'] = $matches[1][0];

//JSON
$json = json_encode($user_props, JSON_UNESCAPED_SLASHES);

$stmt = $db->prepare("UPDATE `users` SET `json` = ? WHERE `id` = ?"); 
$stmt->bind_param("ss", $json, $person['id']);
$stmt->execute();
$stmt->close();

// DB CLOSE
mysqli_close($db);

header('Content-type: application/json');
exit($json);

?>