<?php
/**
 * Formulario de contacto — Las Pilcas
 * Envío seguro a contacto@laspilcas.cl con From fijo y Reply-To del cliente.
 */

// Codificación UTF-8 en toda la salida
header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtener y limpiar datos (el formulario envía "whatsapp" para teléfono)
$nombre   = isset($_POST['nombre'])   ? trim($_POST['nombre'])   : '';
$email    = isset($_POST['email'])    ? trim($_POST['email'])    : '';
$telefono = isset($_POST['whatsapp']) ? trim($_POST['whatsapp']) : '';
$asunto   = isset($_POST['asunto'])   ? trim($_POST['asunto'])   : 'Información General';
$mensaje  = isset($_POST['mensaje'])  ? trim($_POST['mensaje'])  : '';

// ——— Validación: ningún campo obligatorio vacío ———
$errores = [];
if ($nombre === '')   $errores[] = 'El nombre es obligatorio.';
if ($email === '')    $errores[] = 'El correo electrónico es obligatorio.';
if ($telefono === '') $errores[] = 'El teléfono es obligatorio.';
if ($mensaje === '')  $errores[] = 'El mensaje es obligatorio.';

if (!empty($errores)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => implode(' ', $errores)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validar formato básico de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El correo electrónico no es válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Destino fijo
$para = 'contacto@laspilcas.cl';
$asunto_correo = 'Nuevo mensaje desde el sitio Las Pilcas';

// Cuerpo del correo en HTML, bien organizado y escapado en UTF-8
$nombre_s   = htmlspecialchars($nombre,   ENT_QUOTES, 'UTF-8');
$email_s    = htmlspecialchars($email,    ENT_QUOTES, 'UTF-8');
$telefono_s = htmlspecialchars($telefono, ENT_QUOTES, 'UTF-8');
$asunto_s   = htmlspecialchars($asunto,   ENT_QUOTES, 'UTF-8');
$mensaje_s  = nl2br(htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'));

$body  = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">';
$body .= '<h2 style="color: #047857;">Nuevo mensaje desde el formulario de contacto</h2>';
$body .= '<table style="border-collapse: collapse; width: 100%; max-width: 560px;">';
$body .= '<tr><td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold; width: 140px;">Nombre</td>';
$body .= '<td style="padding: 8px 12px; border: 1px solid #ddd;">' . $nombre_s . '</td></tr>';
$body .= '<tr><td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Email</td>';
$body .= '<td style="padding: 8px 12px; border: 1px solid #ddd;">' . $email_s . '</td></tr>';
$body .= '<tr><td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Teléfono</td>';
$body .= '<td style="padding: 8px 12px; border: 1px solid #ddd;">' . $telefono_s . '</td></tr>';
$body .= '<tr><td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Interés principal</td>';
$body .= '<td style="padding: 8px 12px; border: 1px solid #ddd;">' . $asunto_s . '</td></tr>';
$body .= '<tr><td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Mensaje</td>';
$body .= '<td style="padding: 8px 12px; border: 1px solid #ddd;">' . $mensaje_s . '</td></tr>';
$body .= '</table>';
$body .= '</body></html>';

// Remitente fijo: contacto@laspilcas.cl (evita bloqueos por suplantación)
// Reply-To: correo del cliente para que "Responder" le llegue a él
$from_address = 'contacto@laspilcas.cl';
$from_name    = 'Las Pilcas Web';
$reply_to     = $email;

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "From: " . $from_name . " <" . $from_address . ">\r\n";
$headers .= "Reply-To: " . $reply_to . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// Codificación del asunto para UTF-8 (tildes y ñ)
$asunto_encoded = '=?UTF-8?B?' . base64_encode($asunto_correo) . '?=';

$enviado = @mail($para, $asunto_encoded, $body, $headers);

if ($enviado) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'No se pudo enviar el correo. Intente más tarde o escríbanos a contacto@laspilcas.cl.'
    ], JSON_UNESCAPED_UNICODE);
}
