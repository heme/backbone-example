<?php

// phpinfo();
// exit(0);

$list_url = "http://dir/Application/wrbc_phone.nsf/LUPL?OpenView&RestrictToCategory=BTSUrbandale,IA&Company=Berkley%20Technology%20Services%20(Urbandale%2C%20IA)";

//open connection
$curl = curl_init(); 
curl_setopt($curl, CURLOPT_URL, $list_url); 
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1); 
$output = curl_exec($curl); 
curl_close($curl);

$matches = null;
preg_match_all('/\<a href="(.*)" target="_self">\<div style="width:150px">  (.*), (.*)\<\/div>\<\/a>/U',$output,$matches);


// DB connection
$db = mysqli_connect("localhost","root","root","bbdir");
if (mysqli_connect_errno($db)) {
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
	exit();
}

$errors = array();
$person = array();
foreach($matches[1] as $key => $link) {
	$person['first_name'] = $db->real_escape_string($matches[3][$key]);
	$person['last_name'] = $db->real_escape_string($matches[2][$key]);
	$person['link'] = 'http://dir' . $link;

	$sql = "INSERT INTO `users`(`first_name`, `last_name`, `link`) VALUES ('".$person['first_name']."', '".$person['last_name']."','" . $person['link'] . "')";
	if (!$db->query($sql)) {
		array_push($errors, "INSERT failed: (" . $db->errno . ") " . $db->error);
	}   

}


echo "<pre>";
print_r($errors);
echo "</pre>";

// DB CLOSE
mysqli_close($db);

?>