<?php
if(isset($_POST["Query"])){

$xml = simplexml_load_file("http://192.9.200.62:8080/xml/queries.xml");
$query = $xml->xpath("/queries/query[@name='".$_POST["Query"]."']");

if($query){
    echo json_encode($query[0]->parameters);
}else{
    echo "[]";
}

}
?>