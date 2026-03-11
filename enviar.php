<?php
/**
 * Formulario de contacto — Las Pilcas
 * Destinatario: contacto@laspilcas.cl | From fijo, Reply-To del cliente. Respuesta JSON.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nombre   = isset($_POST["nombre"])   ? trim($_POST["nombre"])   : '';
    $email    = isset($_POST["email"])    ? trim($_POST["email"])    : '';
    $telefono = isset($_POST["whatsapp"]) ? trim($_POST["whatsapp"]) : '';
    $mensaje  = isset($_POST["mensaje"])  ? trim($_POST["mensaje"])  : '';

    $ok = ($nombre !== '' && $email !== '' && $telefono !== '' && $mensaje !== '');
    if ($ok && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $ok = false;
    }

    if ($ok) {
        $para = 'contacto@laspilcas.cl';
        $asunto = 'Nuevo mensaje desde el sitio Las Pilcas';

        $cuerpo  = "Nuevo mensaje desde el formulario de contacto\n";
        $cuerpo .= "------------------------------------------\n\n";
        $cuerpo .= "Nombre:   " . $nombre   . "\n";
        $cuerpo .= "Email:    " . $email    . "\n";
        $cuerpo .= "Teléfono: " . $telefono . "\n\n";
        $cuerpo .= "Mensaje:\n" . $mensaje . "\n";

        $headers  = "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "From: contacto@laspilcas.cl\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";

        $asunto_utf8 = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
        $enviado = @mail($para, $asunto_utf8, $cuerpo, $headers);

        if ($enviado) {
            echo json_encode(['status' => 'success'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    echo json_encode(['status' => 'error'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['status' => 'error'], JSON_UNESCAPED_UNICODE);
