"""Application logging configuration"""
import logging
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create formatter
formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# File handler
file_handler = logging.FileHandler(log_dir / "app.log")
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.DEBUG)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    handlers=[console_handler, file_handler]
)

# Get logger function
def get_logger(name: str) -> logging.Logger:
    """Get logger with specified name"""
    return logging.getLogger(name)


# Default logger
logger = get_logger(__name__)
