package com.financeai.dto;

import com.financeai.model.Notification;

public final class NotificationDto {

    private NotificationDto() {}

    public record NotificationResponse(
            Long id, String type, String title, String message, String action,
            boolean unread, String time, String date
    ) {
        public static NotificationResponse from(Notification n) {
            return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                    n.getAction(), !n.isReadFlag(), formatRelative(n.getCreatedAt()), n.getCreatedAt().toString());
        }

        private static String formatRelative(java.time.LocalDateTime dt) {
            long minutes = java.time.Duration.between(dt, java.time.LocalDateTime.now()).toMinutes();
            if (minutes < 1) return "Just now";
            if (minutes < 60) return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
            long hours = minutes / 60;
            if (hours < 24) return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
            long days = hours / 24;
            if (days < 30) return days + " day" + (days == 1 ? "" : "s") + " ago";
            return dt.toLocalDate().toString();
        }
    }
}