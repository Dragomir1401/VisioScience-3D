package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const (
	metricPrefix = "user_data_service_"
)

var (
	registry = prometheus.NewRegistry()

	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: metricPrefix + "http_requests_total",
			Help: "Total number of HTTP requests to user-data-service",
		},
		[]string{"method", "endpoint", "status"},
	)

	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    metricPrefix + "http_request_duration_seconds",
			Help:    "Duration of HTTP requests to user-data-service",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	ActiveUsers = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_users",
			Help: "Number of active users",
		},
	)

	ActiveClasses = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_classes",
			Help: "Number of active classes",
		},
	)

	ActiveInvites = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: metricPrefix + "active_invites",
			Help: "Number of active invites",
		},
	)
)

func RegisterMetrics() {
	registry.MustRegister(
		HTTPRequestsTotal,
		HTTPRequestDuration,
		ActiveUsers,
		ActiveClasses,
		ActiveInvites,
	)
}

func GetHandler() http.Handler {
	return promhttp.HandlerFor(registry, promhttp.HandlerOpts{})
}
