"""Domain layer exceptions"""


class DomainException(Exception):
    """Base domain exception"""
    pass


class UserNotFoundException(DomainException):
    """User not found exception"""
    pass


class UserAlreadyExistsException(DomainException):
    """User already exists exception"""
    pass


class RoomNotFoundException(DomainException):
    """Room not found exception"""
    pass


class RoomAlreadyClosedException(DomainException):
    """Room already closed exception"""
    pass


class ParticipantAlreadyInRoomException(DomainException):
    """Participant already in room exception"""
    pass


class ParticipantNotInRoomException(DomainException):
    """Participant not in room exception"""
    pass


class CallSessionNotFoundException(DomainException):
    """Call session not found exception"""
    pass


class CallSessionAlreadyEndedException(DomainException):
    """Call session already ended exception"""
    pass
