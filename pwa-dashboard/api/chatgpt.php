<?php
require_once '../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$type = $input['type'] ?? '';
$language = $input['language'] ?? 'en';
$category = $input['category'] ?? '';

// ChatGPT API Configuration
// Note: Add your OpenAI API key to a config file or environment variable
$chatgptApiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY') ?? '';
$chatgptApiUrl = 'https://api.openai.com/v1/chat/completions';

if (empty($chatgptApiKey)) {
    // Return mock data if API key not configured
    if ($type === 'description') {
        $mockDescription = "Welcome to this amazing app! Experience the best in mobile gaming with stunning graphics, smooth gameplay, and endless entertainment. Download now and join thousands of satisfied users!";
        echo json_encode(['success' => true, 'text' => $mockDescription]);
        exit;
    } elseif ($type === 'comments') {
        $count = $input['count'] ?? 5;
        $mockComments = [];
        for ($i = 0; $i < $count; $i++) {
            $mockComments[] = [
                'username' => 'User' . ($i + 1),
                'rating' => rand(4, 5),
                'text' => 'Great app! Love the features and design. Highly recommended!'
            ];
        }
        echo json_encode(['success' => true, 'comments' => $mockComments]);
        exit;
    }
}

try {
    if ($type === 'description') {
        $prompt = $input['prompt'] ?? "Write an app description for a {$category} app in {$language} language";
        
        $messages = [
            [
                'role' => 'system',
                'content' => "You are a professional app store copywriter. Write compelling app descriptions in {$language} language."
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];
        
        $response = callChatGPTAPI($chatgptApiKey, $chatgptApiUrl, $messages);
        
        if ($response && isset($response['choices'][0]['message']['content'])) {
            $text = $response['choices'][0]['message']['content'];
            echo json_encode(['success' => true, 'text' => $text]);
        } else {
            throw new Exception('Invalid response from ChatGPT API');
        }
        
    } elseif ($type === 'comments') {
        $count = $input['count'] ?? 5;
        
        $prompt = "Generate {$count} realistic app store user reviews in {$language} language for a {$category} app. Return as JSON array with 'username', 'rating' (1-5), and 'text' fields.";
        
        $messages = [
            [
                'role' => 'system',
                'content' => "You are generating realistic app store reviews. Return valid JSON only."
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];
        
        $response = callChatGPTAPI($chatgptApiKey, $chatgptApiUrl, $messages);
        
        if ($response && isset($response['choices'][0]['message']['content'])) {
            $content = $response['choices'][0]['message']['content'];
            // Try to extract JSON from response
            $jsonMatch = [];
            if (preg_match('/\[.*\]/s', $content, $jsonMatch)) {
                $comments = json_decode($jsonMatch[0], true);
                if ($comments && is_array($comments)) {
                    echo json_encode(['success' => true, 'comments' => $comments]);
                } else {
                    throw new Exception('Failed to parse comments');
                }
            } else {
                throw new Exception('No JSON found in response');
            }
        } else {
            throw new Exception('Invalid response from ChatGPT API');
        }
        
    } else {
        throw new Exception('Invalid type');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function callChatGPTAPI($apiKey, $apiUrl, $messages) {
    $ch = curl_init($apiUrl);
    
    $data = [
        'model' => 'gpt-3.5-turbo',
        'messages' => $messages,
        'max_tokens' => 500,
        'temperature' => 0.7
    ];
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('ChatGPT API error: HTTP ' . $httpCode);
    }
    
    return json_decode($response, true);
}

