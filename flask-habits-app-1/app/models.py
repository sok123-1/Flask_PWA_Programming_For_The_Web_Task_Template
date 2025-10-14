from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class Habit(Base):
    __tablename__ = 'habits'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    streaks = relationship('Streak', back_populates='habit')

class Streak(Base):
    __tablename__ = 'streaks'

    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey('habits.id'), nullable=False)
    days = Column(Integer, default=0)
    habit = relationship('Habit', back_populates='streaks')