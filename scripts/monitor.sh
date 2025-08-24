#!/bin/bash

LOG_FILE="logs/indexer.log"
ALERT_EMAIL="admin@yourcompany.com"

check_process() {
    if ! pgrep -f "solana-transaction-indexer" > /dev/null; then
        echo "$(date): Indexer process not found! Restarting..." >> $LOG_FILE
        npm start &
        echo "Solana indexer restarted at $(date)" | mail -s "Indexer Alert" $ALERT_EMAIL
    fi
}

check_database() {
    if ! npm run test:db > /dev/null 2>&1; then
        echo "$(date): Database connection failed!" >> $LOG_FILE
        echo "Database connection failed at $(date)" | mail -s "Database Alert" $ALERT_EMAIL
    fi
}

check_disk_space() {
    USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $USAGE -gt 80 ]; then
        echo "$(date): Disk usage high: ${USAGE}%" >> $LOG_FILE
        echo "Disk usage is ${USAGE}% at $(date)" | mail -s "Disk Space Alert" $ALERT_EMAIL
    fi
}

check_process
check_database
check_disk_space

echo "$(date): Health check completed" >> $LOG_FILE
