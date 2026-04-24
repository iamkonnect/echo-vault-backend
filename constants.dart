class ApiConstants {
  // For Android Emulator, use 10.0.2.2
  // For iOS Simulator, use localhost
  // For Physical devices, use your computer's local IP (e.g., 192.168.1.10)
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';\n  static const String artistInsightsEndpoint = '$baseUrl/artist/insights';\n  static const String adminStatsEndpoint = '$baseUrl/admin/stats';\n}
