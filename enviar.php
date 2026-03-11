<?php
// Configuración básica
header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$nombre   = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$email    = isset($_POST['email']) ? trim($_POST['email']) : '';
$telefono = isset($_POST['whatsapp']) ? trim($_POST['whatsapp']) : '';
$asunto   = isset($_POST['asunto']) ? trim($_POST['asunto']) : 'Consulta desde formulario web';
$mensaje  = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';

if ($nombre === '' || $email === '' || $mensaje === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan campos obligatorios']);
    exit;
}

// Dirección de destino
$para = 'contacto@laspilcas.cl';
$subject = 'Nuevo mensaje desde el sitio Las Pilcas';

// Cuerpo del mensaje en HTML
$body  = '<html><body style="font-family: Arial, sans-serif; color:#111;">';
$body .= '<h2>Nuevo mensaje desde el formulario de contacto</h2>';
$body .= '<p><strong>Nombre:</strong> ' . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') . '</p>';
$body .= '<p><strong>Email:</strong> ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</p>';
$body .= '<p><strong>Teléfono / WhatsApp:</strong> ' . htmlspecialchars($telefono, ENT_QUOTES, 'UTF-8') . '</p>';
$body .= '<p><strong>Interés Principal:</strong> ' . htmlspecialchars($asunto, ENT_QUOTES, 'UTF-8') . '</p>';
$body .= '<p><strong>Mensaje:</strong><br>' . nl2br(htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8')) . '</p>';
$body .= '</body></html>';

// Cabeceras
$headers   = "MIME-Version: 1.0\r\n";
$headers  .= "Content-type: text/html; charset=UTF-8\r\n";
$headers  .= "From: Las Pilcas <no-reply@laspilcas.cl>\r\n";
if ($email !== '') {
    $headers .= "Reply-To: " . $email . "\r\n";
}

// Enviar correo
$enviado = mail($para, $subject, $body, $headers);

if ($enviado) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo enviar el correo']);
}

