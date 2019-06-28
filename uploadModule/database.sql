#------------------------------------------------------------
#        Script MySQL.
#------------------------------------------------------------

#------------------------------------------------------------
# Database: atelierJF
#------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS atelierJF;

USE atelierJF;

#------------------------------------------------------------
# Table: sections
#------------------------------------------------------------

CREATE TABLE sections(
        id           Int  Auto_increment  NOT NULL ,
        section      Varchar (50) NOT NULL ,
        creationDate Datetime NOT NULL ,
        nbSubSection Int NOT NULL
	,CONSTRAINT sections_PK PRIMARY KEY (id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: contacts
#------------------------------------------------------------

CREATE TABLE contacts(
        id    Int  Auto_increment  NOT NULL ,
        lname Varchar (60) NOT NULL ,
        fname Varchar (60) NOT NULL ,
        mail  Varchar (320) NOT NULL
	,CONSTRAINT contacts_PK PRIMARY KEY (id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: msgContacts
#------------------------------------------------------------

CREATE TABLE msgContacts(
        id          Int  Auto_increment  NOT NULL ,
        msg         Text NOT NULL ,
        msgDate     Datetime NOT NULL ,
        id_contacts Int NOT NULL
	,CONSTRAINT msgContacts_PK PRIMARY KEY (id)

	,CONSTRAINT msgContacts_contacts_FK FOREIGN KEY (id_contacts) REFERENCES contacts(id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: subSections
#------------------------------------------------------------

CREATE TABLE subSections(
        id           Int  Auto_increment  NOT NULL ,
        subSection   Varchar (100) NOT NULL ,
        creationDate Datetime NOT NULL ,
        nbImgs       Int NOT NULL ,
        id_sections  Int NOT NULL
	,CONSTRAINT subSections_PK PRIMARY KEY (id)

	,CONSTRAINT subSections_sections_FK FOREIGN KEY (id_sections) REFERENCES sections(id)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: pieces
#------------------------------------------------------------

CREATE TABLE pieces(
        id              Int  Auto_increment  NOT NULL ,
        imgTitle        Varchar (100) NOT NULL ,
        imgLink         Varchar (50) NOT NULL ,
        imgStory        Mediumtext NOT NULL ,
        imgCreationDate Date NOT NULL ,
        imgUploadDate   Datetime NOT NULL ,
        imgPrice        DECIMAL (15,3)  NOT NULL ,
        id_subSections  Int NOT NULL
	,CONSTRAINT pieces_PK PRIMARY KEY (id)

	,CONSTRAINT pieces_subSections_FK FOREIGN KEY (id_subSections) REFERENCES subSections(id)
)ENGINE=InnoDB;
