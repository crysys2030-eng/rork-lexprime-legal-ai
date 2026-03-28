import { useLegalData } from '@/contexts/LegalDataContext';
import { Activity, BarChart3, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors from '@/constants/colors';

export default function AnalyticsScreen() {
  const { cases, clients, loading } = useLegalData();

  const stats = useMemo(() => {
    const activeCases = cases.filter(c => c.status === 'active').length;
    const pendingCases = cases.filter(c => c.status === 'pending').length;
    const closedCases = cases.filter(c => c.status === 'closed').length;
    const highPriorityCases = cases.filter(c => c.priority === 'high').length;
    
    const totalDeadlines = cases.reduce((sum, c) => sum + c.deadlines.length, 0);
    const completedDeadlines = cases.reduce(
      (sum, c) => sum + c.deadlines.filter(d => d.completed).length,
      0
    );
    
    const completionRate = totalDeadlines > 0 
      ? Math.round((completedDeadlines / totalDeadlines) * 100)
      : 0;

    const casesByPriority = {
      high: cases.filter(c => c.priority === 'high').length,
      medium: cases.filter(c => c.priority === 'medium').length,
      low: cases.filter(c => c.priority === 'low').length,
    };

    return {
      activeCases,
      pendingCases,
      closedCases,
      highPriorityCases,
      totalCases: cases.length,
      totalClients: clients.length,
      totalDeadlines,
      completedDeadlines,
      completionRate,
      casesByPriority,
    };
  }, [cases, clients]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visão Geral</Text>
        <Text style={styles.headerSubtitle}>
          Análise da sua prática jurídica
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.largeStatCard}>
          <View style={styles.largeStatHeader}>
            <BarChart3 size={24} color={Colors.primary} />
            <Text style={styles.largeStatValue}>{stats.totalCases}</Text>
          </View>
          <Text style={styles.largeStatLabel}>Total de Casos</Text>
          <View style={styles.breakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.statusActive }]} />
              <Text style={styles.breakdownText}>{stats.activeCases} Ativos</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.statusPending }]} />
              <Text style={styles.breakdownText}>{stats.pendingCases} Pendentes</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.statusClosed }]} />
              <Text style={styles.breakdownText}>{stats.closedCases} Encerrados</Text>
            </View>
          </View>
        </View>

        <View style={styles.largeStatCard}>
          <View style={styles.largeStatHeader}>
            <TrendingUp size={24} color={Colors.success} />
            <Text style={[styles.largeStatValue, { color: Colors.success }]}>
              {stats.completionRate}%
            </Text>
          </View>
          <Text style={styles.largeStatLabel}>Taxa de Conclusão</Text>
          <Text style={styles.statSubtext}>
            {stats.completedDeadlines} de {stats.totalDeadlines} prazos cumpridos
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuição por Prioridade</Text>
        <View style={styles.priorityCards}>
          <View style={[styles.priorityCard, { borderLeftColor: Colors.priorityHigh }]}>
            <Text style={[styles.priorityValue, { color: Colors.priorityHigh }]}>
              {stats.casesByPriority.high}
            </Text>
            <Text style={styles.priorityLabel}>Alta Prioridade</Text>
          </View>
          <View style={[styles.priorityCard, { borderLeftColor: Colors.priorityMedium }]}>
            <Text style={[styles.priorityValue, { color: Colors.priorityMedium }]}>
              {stats.casesByPriority.medium}
            </Text>
            <Text style={styles.priorityLabel}>Média Prioridade</Text>
          </View>
          <View style={[styles.priorityCard, { borderLeftColor: Colors.priorityLow }]}>
            <Text style={[styles.priorityValue, { color: Colors.priorityLow }]}>
              {stats.casesByPriority.low}
            </Text>
            <Text style={styles.priorityLabel}>Baixa Prioridade</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas Gerais</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Activity size={20} color={Colors.primary} />
            <Text style={styles.metricValue}>{stats.totalClients}</Text>
            <Text style={styles.metricLabel}>Clientes Ativos</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity size={20} color={Colors.error} />
            <Text style={styles.metricValue}>{stats.highPriorityCases}</Text>
            <Text style={styles.metricLabel}>Casos Urgentes</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity size={20} color={Colors.warning} />
            <Text style={styles.metricValue}>{stats.totalDeadlines - stats.completedDeadlines}</Text>
            <Text style={styles.metricLabel}>Prazos Pendentes</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity size={20} color={Colors.success} />
            <Text style={styles.metricValue}>{stats.completedDeadlines}</Text>
            <Text style={styles.metricLabel}>Prazos Cumpridos</Text>
          </View>
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>💡 Insight</Text>
        <Text style={styles.insightText}>
          {stats.highPriorityCases > 0
            ? `Você tem ${stats.highPriorityCases} caso${stats.highPriorityCases > 1 ? 's' : ''} de alta prioridade que ${stats.highPriorityCases > 1 ? 'requerem' : 'requer'} atenção imediata.`
            : 'Excelente trabalho! Todos os casos prioritários estão sob controle.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  largeStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  largeStatHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  largeStatValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  largeStatLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  statSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdown: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  priorityCards: {
    gap: 12,
  },
  priorityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  priorityValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  priorityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  insightCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
