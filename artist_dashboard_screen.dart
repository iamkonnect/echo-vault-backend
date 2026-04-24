import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class ArtistDashboardScreen extends StatefulWidget {
  const ArtistDashboardScreen({super.key});

  @override
  State<ArtistDashboardScreen> createState() => _ArtistDashboardScreenState();
}

class _ArtistDashboardScreenState extends State<ArtistDashboardScreen> {
  Map<String, dynamic>? _insights;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInsights();
  }

  Future<void> _loadInsights() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) {
        _error = 'Not authenticated';
        setState(() => _isLoading = false);
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/artist/insights'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        setState(() {
          _insights = jsonDecode(response.body);
          _isLoading = false;
        });
      } else {
        _error = 'Failed to load insights';
        setState(() => _isLoading = false);
      }
    } catch (e) {
      _error = 'Connection error';
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Artist Dashboard'), backgroundColor: Colors.purpleAccent),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Welcome!', style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 20),
                      _statsGrid(),
                      const SizedBox(height: 20),
                      _shortsTable(),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadInsights,
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _statsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      childAspectRatio: 1.2,
      children: [
        _statCard('Total Plays', _insights?['totalPlays']?.toString() ?? '0', Icons.play_arrow, Colors.green),
        _statCard('Earnings', '\$${_insights?['totalEarnings']?.toStringAsFixed(2) ?? '0.00'}', Icons.monetization_on, Colors.blue),
        _statCard('Balance', '\$${_insights?['currentBalance']?.toStringAsFixed(2) ?? '0.00'}', Icons.account_balance_wallet, Colors.orange),
      ],
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _shortsTable() {
    final shorts = _insights?['shorts'] as List? ?? [];
    if (shorts.isEmpty) return const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('No shorts yet')));

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Recent Shorts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 12),
            ...shorts.take(5).map((s) => ListTile(
                  leading: const Icon(Icons.video_library),
                  title: Text(s['title']),
                  subtitle: Text('${s['playCount']} plays • ${s['giftCount']} gifts'),
                )),
          ],
        ),
      ),
    );
  }
}

