package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const (
	metricPrefix = "feed_data_service_"
)

var (
	// Create a custom registry
	registry = prometheus.NewRegistry()

	// HTTP metrics
	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "http_requests_total",
			Help: "Total number of HTTP requests to feed service",
		},
		[]string{"method", "endpoint", "status"},
	)

	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    metricPrefix + "http_request_duration_seconds",
			Help:    "Duration of HTTP requests to feed service",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// Feed metrics
	ActiveFeeds = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_feeds",
			Help: "Number of active feeds",
		},
	)

	ActiveMolecules = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_molecules",
			Help: "Number of active molecules",
		},
	)

	FeedOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "feed_operations_total",
			Help: "Total number of feed operations",
		},
		[]string{"operation", "shape"},
	)

	MoleculeOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "molecule_operations_total",
			Help: "Total number of molecule operations",
		},
		[]string{"operation"},
	)

	ActiveInvites = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_invites",
			Help: "Number of active invites",
		},
	)
)

// RegisterMetrics registers all metrics with our custom registry
func RegisterMetrics() {
	registry.MustRegister(
		HTTPRequestsTotal,
		HTTPRequestDuration,
		ActiveFeeds,
		ActiveMolecules,
		FeedOperations,
		MoleculeOperations,
		ActiveInvites,
	)
}

// GetHandler returns a new promhttp.Handler for our custom registry
func GetHandler() http.Handler {
	return promhttp.HandlerFor(registry, promhttp.HandlerOpts{})
}
