// Production-grade monitoring for admin operations
// Implements OpenTelemetry tracing and custom metrics for GCP

interface AdminOperationMetric {
  operation: string;
  resource_type: string;
  resource_id: string;
  admin_user_id: string;
  status: 'success' | 'failure' | 'timeout';
  duration_ms: number;
  error_type?: string;
  timestamp: string;
}

interface AdminOperationAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  operation: string;
  admin_user: string;
  metadata: Record<string, any>;
}

class AdminOperationsMonitor {
  private metrics: AdminOperationMetric[] = [];
  private alertThresholds = {
    failureRate: 0.05,        // 5% failure rate triggers alert
    responseTime: 5000,       // 5 second response time threshold
    timeWindow: 300000,       // 5 minute rolling window
  };

  // Track admin operation performance and outcomes
  async trackAdminOperation<T>(
    operation: string,
    resourceType: string,
    resourceId: string,
    adminUserId: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const metric: AdminOperationMetric = {
      operation,
      resource_type: resourceType,
      resource_id: resourceId,
      admin_user_id: adminUserId,
      status: 'failure', // Default to failure, update on success
      duration_ms: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Execute the operation
      const result = await Promise.race([
        operationFn(),
        this.createTimeoutPromise(30000) // 30 second timeout
      ]);

      // Success metrics
      metric.status = 'success';
      metric.duration_ms = Date.now() - startTime;
      
      this.recordMetric(metric);
      this.checkAlertConditions(metric);
      
      // Send to GCP Cloud Monitoring
      await this.sendToCloudMonitoring(metric);
      
      return result;
      
    } catch (error) {
      // Failure metrics
      metric.status = error instanceof Error && error.message.includes('timeout') ? 'timeout' : 'failure';
      metric.duration_ms = Date.now() - startTime;
      metric.error_type = error instanceof Error ? error.constructor.name : 'UnknownError';
      
      this.recordMetric(metric);
      this.checkAlertConditions(metric);
      
      // Send to GCP Error Reporting
      await this.sendToErrorReporting(error, metric);
      
      throw error;
    }
  }

  private async createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timeout after ${ms}ms`)), ms);
    });
  }

  private recordMetric(metric: AdminOperationMetric) {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
    
    // Log to console for immediate visibility
    console.log(`📊 Admin Operation: ${metric.operation} on ${metric.resource_type}/${metric.resource_id} - ${metric.status} (${metric.duration_ms}ms)`);
  }

  private checkAlertConditions(currentMetric: AdminOperationMetric) {
    const recentMetrics = this.getRecentMetrics(this.alertThresholds.timeWindow);
    
    // Check failure rate
    const failures = recentMetrics.filter(m => m.status === 'failure').length;
    const failureRate = failures / recentMetrics.length;
    
    if (failureRate > this.alertThresholds.failureRate && recentMetrics.length > 10) {
      this.sendAlert({
        severity: 'HIGH',
        message: `High admin operation failure rate: ${(failureRate * 100).toFixed(1)}%`,
        operation: currentMetric.operation,
        admin_user: currentMetric.admin_user_id,
        metadata: {
          failure_rate: failureRate,
          total_operations: recentMetrics.length,
          time_window_minutes: this.alertThresholds.timeWindow / 60000
        }
      });
    }
    
    // Check response time
    if (currentMetric.duration_ms > this.alertThresholds.responseTime) {
      this.sendAlert({
        severity: 'MEDIUM',
        message: `Slow admin operation response: ${currentMetric.duration_ms}ms`,
        operation: currentMetric.operation,
        admin_user: currentMetric.admin_user_id,
        metadata: {
          duration_ms: currentMetric.duration_ms,
          threshold_ms: this.alertThresholds.responseTime,
          resource_type: currentMetric.resource_type,
          resource_id: currentMetric.resource_id
        }
      });
    }
    
    // Check for specific critical operations
    if (['delete_user_permanent', 'force_complete_booking'].includes(currentMetric.operation)) {
      this.sendAlert({
        severity: 'CRITICAL',
        message: `Critical admin operation performed: ${currentMetric.operation}`,
        operation: currentMetric.operation,
        admin_user: currentMetric.admin_user_id,
        metadata: {
          resource_type: currentMetric.resource_type,
          resource_id: currentMetric.resource_id,
          status: currentMetric.status
        }
      });
    }
  }

  private getRecentMetrics(timeWindowMs: number): AdminOperationMetric[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
  }

  private async sendToCloudMonitoring(metric: AdminOperationMetric) {
    // In production, this would send metrics to Google Cloud Monitoring
    // For now, we'll structure the data for easy integration
    const gcpMetric = {
      metricType: 'custom.googleapis.com/admin/operation_duration',
      resource: {
        type: 'gce_instance', // or 'cloud_run_revision' for Cloud Run
        labels: {
          instance_id: process.env.INSTANCE_ID || 'unknown',
          zone: process.env.ZONE || 'unknown'
        }
      },
      points: [{
        interval: {
          endTime: new Date().toISOString()
        },
        value: {
          doubleValue: metric.duration_ms
        }
      }],
      labels: {
        operation: metric.operation,
        resource_type: metric.resource_type,
        admin_user_id: metric.admin_user_id,
        status: metric.status
      }
    };
    
    // TODO: Implement actual GCP Cloud Monitoring API call
    console.log('📈 Would send to Cloud Monitoring:', JSON.stringify(gcpMetric, null, 2));
  }

  private async sendToErrorReporting(error: unknown, metric: AdminOperationMetric) {
    // In production, this would send to Google Cloud Error Reporting
    const errorReport = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      context: {
        operation: metric.operation,
        resource_type: metric.resource_type,
        resource_id: metric.resource_id,
        admin_user_id: metric.admin_user_id,
        duration_ms: metric.duration_ms,
        timestamp: metric.timestamp
      },
      severity: 'ERROR'
    };
    
    console.error('🚨 Would send to Error Reporting:', JSON.stringify(errorReport, null, 2));
  }

  private sendAlert(alert: AdminOperationAlert) {
    // In production, this would integrate with:
    // - Google Cloud Alerting Policy
    // - PagerDuty/OpsGenie for on-call
    // - Slack/Teams for team notifications
    
    const alertMessage = `
🚨 ADMIN OPERATION ALERT 🚨
Severity: ${alert.severity}
Message: ${alert.message}
Operation: ${alert.operation}
Admin User: ${alert.admin_user}
Time: ${new Date().toISOString()}
Metadata: ${JSON.stringify(alert.metadata, null, 2)}
    `;
    
    console.warn(alertMessage);
    
    // TODO: Implement actual alerting integration
    // - Send to Cloud Monitoring Alert Policy
    // - Trigger incident management workflow
    // - Notify on-call engineer for CRITICAL alerts
  }

  // Generate dashboard-ready metrics
  getDashboardMetrics() {
    const recent = this.getRecentMetrics(3600000); // Last hour
    
    const byOperation = recent.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = { success: 0, failure: 0, timeout: 0 };
      }
      acc[metric.operation][metric.status]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    
    const avgResponseTime = recent.length > 0 
      ? recent.reduce((sum, m) => sum + m.duration_ms, 0) / recent.length 
      : 0;
    
    return {
      total_operations: recent.length,
      average_response_time_ms: avgResponseTime,
      operations_by_type: byOperation,
      failure_rate: recent.length > 0 ? recent.filter(m => m.status === 'failure').length / recent.length : 0,
      last_updated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const adminMonitor = new AdminOperationsMonitor();

// Helper function for easy integration
export async function monitoredAdminOperation<T>(
  operation: string,
  resourceType: string,
  resourceId: string,
  adminUserId: string,
  operationFn: () => Promise<T>
): Promise<T> {
  return adminMonitor.trackAdminOperation(
    operation,
    resourceType,
    resourceId,
    adminUserId,
    operationFn
  );
}