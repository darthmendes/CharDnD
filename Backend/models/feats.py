from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Feats(Base):
    __tablename__ = "feats"
    id = Column("featID", Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    repeatable = Column(Boolean, default=False)

    prerequisites = relationship("FeatPrerequisites", back_populates="feat")
    benefits = relationship("FeatBenefits", back_populates="feat")
    proficiency_associations = relationship("FeatProficiency", back_populates="feat")
    character_feats = relationship("CharacterFeats", back_populates="feat")

class FeatPrerequisites(Base):
    __tablename__ = "featPrerequisites"
    featID = Column(Integer, ForeignKey("feats.featID"), primary_key=True)
    type = Column(String, primary_key=True)
    target = Column(String, nullable=True)
    value = Column(String, nullable=True)

    feat = relationship("Feats", back_populates="prerequisites")

class FeatBenefits(Base):
    __tablename__ = "featBenefits"
    featID = Column(Integer, ForeignKey("feats.featID"), primary_key=True)
    type = Column(String, primary_key=True)
    target = Column(String, nullable=True)
    value = Column(String, nullable=True)

    feat = relationship("Feats", back_populates="benefits")