package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const (
	metricPrefix = "evaluation_service_"
)

var (
	// Create a custom registry
	registry = prometheus.NewRegistry()

	// HTTP metrics
	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "http_requests_total",
			Help: "Total number of HTTP requests to evaluation service",
		},
		[]string{"method", "endpoint", "status"},
	)

	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    metricPrefix + "http_request_duration_seconds",
			Help:    "Duration of HTTP requests to evaluation service",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// Evaluation metrics
	ActiveEvaluations = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_evaluations",
			Help: "Number of active evaluations",
		},
	)

	EvaluationOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "evaluation_operations_total",
			Help: "Total number of evaluation operations",
		},
		[]string{"operation", "status"},
	)

	EvaluationDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    metricPrefix + "evaluation_duration_seconds",
			Help:    "Duration of evaluation operations",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation"},
	)
)

// RegisterMetrics registers all metrics with our custom registry
func RegisterMetrics() {
	registry.MustRegister(
		HTTPRequestsTotal,
		HTTPRequestDuration,
		ActiveEvaluations,
		EvaluationOperations,
		EvaluationDuration,
	)
}

// GetHandler returns a new promhttp.Handler for our custom registry
func GetHandler() http.Handler {
	return promhttp.HandlerFor(registry, promhttp.HandlerOpts{})
}
