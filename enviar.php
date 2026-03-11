<?php
/**
 * Formulario de contacto — Las Pilcas (optimizado para cPanel)
 * Destinatario: contacto@laspilcas.cl | From fijo para evitar bloqueo por spoofing.
 */

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Obtener y limpiar variables de forma segura (teléfono viene como "whatsapp" en el formulario)
    $nombre   = isset($_POST["nombre"])   ? trim($_POST["nombre"])   : '';
    $email    = isset($_POST["email"])    ? trim($_POST["email"])    : '';
    $telefono = isset($_POST["whatsapp"]) ? trim($_POST["whatsapp"]) : '';
    $mensaje  = isset($_POST["mensaje"])  ? trim($_POST["mensaje"])  : '';

    // Validación mínima: no enviar si faltan datos obligatorios
    $ok = ($nombre !== '' && $email !== '' && $telefono !== '' && $mensaje !== '');
    if ($ok && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $ok = false;
    }

    if ($ok) {
        $para = 'contacto@laspilcas.cl';
        $asunto = 'Nuevo mensaje desde el sitio Las Pilcas';

        // Cuerpo en texto plano, UTF-8
        $cuerpo  = "Nuevo mensaje desde el formulario de contacto\n";
        $cuerpo .= "------------------------------------------\n\n";
        $cuerpo .= "Nombre:   " . $nombre   . "\n";
        $cuerpo .= "Email:    " . $email    . "\n";
        $cuerpo .= "Teléfono: " . $telefono . "\n\n";
        $cuerpo .= "Mensaje:\n" . $mensaje . "\n";

        // Encabezados compatibles con cPanel
        $from = 'contacto@laspilcas.cl';
        $headers  = "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "From: " . $from . "\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";

        $asunto_utf8 = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
        $enviado = @mail($para, $asunto_utf8, $cuerpo, $headers);

        if ($enviado) {
            header("Location: index.html?envio=exito#contacto");
            exit;
        }
    }

    // Si no se envió (error o validación), redirigir igual para no dejar en blanco
    header("Location: index.html?envio=error#contacto");
    exit;
}

// Si se accede por GET, volver al inicio
header("Location: index.html#contacto");
exit;
