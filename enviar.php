<?php
/**
 * Formulario de contacto — Las Pilcas
 * Destinatario: contacto@laspilcas.cl | From fijo, Reply-To del cliente. Respuesta JSON.
 */

header('Content-Type: application/json; charset=utf-8');

// A los bots se les responde "success" sin enviar nada, para no darles pistas de que fueron detectados.
function responder_ok_falso() {
    echo json_encode(['status' => 'success'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- Honeypot: campo invisible que solo un bot rellenaría ---
    if (trim($_POST['sitio_web'] ?? '') !== '') {
        responder_ok_falso();
    }

    // --- Trampa de tiempo: un humano tarda más de unos segundos en llenar el formulario ---
    $form_ts = (int) ($_POST['form_ts'] ?? 0);
    if ($form_ts <= 0 || (time() - $form_ts) < 3) {
        responder_ok_falso();
    }

    $nombre   = isset($_POST["nombre"])   ? trim($_POST["nombre"])   : '';
    $email    = isset($_POST["email"])    ? trim($_POST["email"])    : '';
    $telefono = isset($_POST["whatsapp"]) ? trim($_POST["whatsapp"]) : '';
    $mensaje  = isset($_POST["mensaje"])  ? trim($_POST["mensaje"])  : '';

    $ok = ($nombre !== '' && $email !== '' && $telefono !== '' && $mensaje !== '');
    if ($ok && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $ok = false;
    }

    // --- Longitudes razonables ---
    if ($ok && (mb_strlen($nombre) > 120 || mb_strlen($telefono) > 40 || mb_strlen($mensaje) > 3000)) {
        $ok = false;
    }

    // --- Contenido típico de spam: enlaces dentro del mensaje o el nombre ---
    if ($ok && preg_match('/https?:\/\/|www\.|\[url=|\[link/i', $nombre . ' ' . $mensaje)) {
        $ok = false;
    }

    // --- Límite de envíos por IP: evita ráfagas del mismo origen ---
    if ($ok) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $archivo = sys_get_temp_dir() . '/laspilcas_ultimo_envio_' . md5($ip) . '.txt';
        $ultimo = @file_get_contents($archivo);
        if ($ultimo !== false && (time() - (int) $ultimo) < 20) {
            responder_ok_falso();
        }
        @file_put_contents($archivo, (string) time());
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
        $headers .= "From: Formulario Las Pilcas <contacto@laspilcas.cl>\r\n";
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
