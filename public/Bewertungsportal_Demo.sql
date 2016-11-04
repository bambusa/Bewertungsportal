CREATE DATABASE  IF NOT EXISTS `bewertungsportal` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `bewertungsportal`;
-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: localhost    Database: bewertungsportal
-- ------------------------------------------------------
-- Server version	5.7.15-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessment`
--

DROP TABLE IF EXISTS `assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessment` (
  `assessment_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_group_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `strategy` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`assessment_id`),
  KEY `assessment_user_fk_idx` (`user_id`),
  KEY `assessment_group_fk_idx` (`user_group_id`),
  CONSTRAINT `assessment_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `assessment_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment`
--

LOCK TABLES `assessment` WRITE;
/*!40000 ALTER TABLE `assessment` DISABLE KEYS */;
INSERT INTO `assessment` VALUES (4,4,2,'Bewertungsprojekt Eins','','2016-11-04 01:42:11',1);
/*!40000 ALTER TABLE `assessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_indicator`
--

DROP TABLE IF EXISTS `custom_indicator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_indicator` (
  `custom_indicator_id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `mmei_cell_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `user_group_id` int(11) DEFAULT NULL,
  `grade_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `target_factor` float NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`custom_indicator_id`),
  KEY `custom_assessment_id_idx` (`assessment_id`),
  KEY `custom_mmei_fk_idx` (`mmei_cell_id`),
  KEY `custom_user_fk_idx` (`user_id`),
  KEY `custom_group_fk_idx` (`user_group_id`),
  KEY `custom_grade_fk_idx` (`grade_id`),
  CONSTRAINT `custom_assessment_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `custom_grade_fk` FOREIGN KEY (`grade_id`) REFERENCES `grade` (`grade_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `custom_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `custom_mmei_fk` FOREIGN KEY (`mmei_cell_id`) REFERENCES `mmei_matrix` (`mmei_cell_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `custom_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_indicator`
--

LOCK TABLES `custom_indicator` WRITE;
/*!40000 ALTER TABLE `custom_indicator` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_indicator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade`
--

DROP TABLE IF EXISTS `grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `grade` float DEFAULT NULL,
  PRIMARY KEY (`grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade`
--

LOCK TABLES `grade` WRITE;
/*!40000 ALTER TABLE `grade` DISABLE KEYS */;
INSERT INTO `grade` VALUES (6,'A','Komplett',1),(7,'B','Gut',0.75),(8,'C','Teilweise',0.5),(9,'D','Grundlegend',0.25),(10,'N','Nicht implementiert',0),(11,'U','Nicht relevant',NULL);
/*!40000 ALTER TABLE `grade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicator`
--

DROP TABLE IF EXISTS `indicator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `indicator` (
  `indicator_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_group_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `target_factor` float DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`indicator_id`),
  KEY `user_fk_idx` (`user_id`),
  KEY `indicator_group_fk_idx` (`user_group_id`),
  CONSTRAINT `indicator_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `indicator_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicator`
--

LOCK TABLES `indicator` WRITE;
/*!40000 ALTER TABLE `indicator` DISABLE KEYS */;
INSERT INTO `indicator` VALUES (7,2,3,'Indikator 1','','2016-11-04 01:31:05',0.1,''),(8,2,3,'Indikator 2','','2016-11-04 01:31:12',0.2,''),(9,2,3,'Indikator 3','','2016-11-04 01:31:17',0.3,''),(10,2,3,'Indikator 4','','2016-11-04 01:31:22',0.4,''),(11,2,3,'Indikator 5','','2016-11-04 01:31:27',0.5,''),(12,2,3,'Indikator 6','','2016-11-04 01:31:34',0.6,'');
/*!40000 ALTER TABLE `indicator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicator_assessment`
--

DROP TABLE IF EXISTS `indicator_assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `indicator_assessment` (
  `indicator_assessment_id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `comment` text,
  PRIMARY KEY (`indicator_assessment_id`),
  KEY `indicator_assessment_assessment_fk_idx` (`assessment_id`),
  KEY `indicator_assessment_indicator_fk_idx` (`indicator_id`),
  KEY `indicator_assessment_grade_fk_idx` (`grade_id`),
  CONSTRAINT `indicator_assessment_assessment_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `indicator_assessment_grade_fk` FOREIGN KEY (`grade_id`) REFERENCES `grade` (`grade_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `indicator_assessment_indicator_fk` FOREIGN KEY (`indicator_id`) REFERENCES `indicator` (`indicator_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicator_assessment`
--

LOCK TABLES `indicator_assessment` WRITE;
/*!40000 ALTER TABLE `indicator_assessment` DISABLE KEYS */;
INSERT INTO `indicator_assessment` VALUES (3,4,7,7,NULL),(4,4,9,8,NULL),(5,4,11,9,NULL),(7,4,10,8,NULL),(8,4,12,11,NULL),(9,4,8,10,NULL);
/*!40000 ALTER TABLE `indicator_assessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicator_in_set`
--

DROP TABLE IF EXISTS `indicator_in_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `indicator_in_set` (
  `indicator_set_id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  PRIMARY KEY (`indicator_set_id`,`indicator_id`),
  KEY `in_set_indicator_fk_idx` (`indicator_id`),
  CONSTRAINT `in_set_indicator_fk` FOREIGN KEY (`indicator_id`) REFERENCES `indicator` (`indicator_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `in_set_set_fk` FOREIGN KEY (`indicator_set_id`) REFERENCES `indicator_set` (`indicator_set_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicator_in_set`
--

LOCK TABLES `indicator_in_set` WRITE;
/*!40000 ALTER TABLE `indicator_in_set` DISABLE KEYS */;
INSERT INTO `indicator_in_set` VALUES (3,7),(4,8),(3,9),(4,10),(3,11),(4,12);
/*!40000 ALTER TABLE `indicator_in_set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `indicator_set`
--

DROP TABLE IF EXISTS `indicator_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `indicator_set` (
  `indicator_set_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_group_id` int(11) DEFAULT NULL,
  `mmei_cell_id` int(11) DEFAULT NULL,
  `visibility_id` int(11) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `maturity_level` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `strategy` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`indicator_set_id`),
  KEY `user_fk_idx` (`user_id`),
  KEY `user_group_fk_idx` (`user_group_id`),
  KEY `set_mmei_fk_idx` (`mmei_cell_id`),
  KEY `set_visibility_fk_idx` (`visibility_id`),
  KEY `set_state_fk_idx` (`state_id`),
  CONSTRAINT `set_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `set_mmei_fk` FOREIGN KEY (`mmei_cell_id`) REFERENCES `mmei_matrix` (`mmei_cell_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `set_state_fk` FOREIGN KEY (`state_id`) REFERENCES `state` (`state_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `set_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `set_visibility_fk` FOREIGN KEY (`visibility_id`) REFERENCES `visibility` (`visibility_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `indicator_set`
--

LOCK TABLES `indicator_set` WRITE;
/*!40000 ALTER TABLE `indicator_set` DISABLE KEYS */;
INSERT INTO `indicator_set` VALUES (3,2,3,8,2,3,'Indikator-Set MMEI 1/1','',1,'2016-11-04 01:33:35',1),(4,2,3,12,2,3,'Indikator-Set MMEI 2/1','',1,'2016-11-04 01:33:50',1);
/*!40000 ALTER TABLE `indicator_set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mmei_matrix`
--

DROP TABLE IF EXISTS `mmei_matrix`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mmei_matrix` (
  `mmei_cell_id` int(11) NOT NULL AUTO_INCREMENT,
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`mmei_cell_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mmei_matrix`
--

LOCK TABLES `mmei_matrix` WRITE;
/*!40000 ALTER TABLE `mmei_matrix` DISABLE KEYS */;
INSERT INTO `mmei_matrix` VALUES (1,1,NULL,'Konzeptuell',NULL),(2,2,NULL,'Technologisch',NULL),(3,3,NULL,'Organisatorisch',NULL),(4,NULL,1,'Geschäft',NULL),(5,NULL,2,'Prozesse',NULL),(6,NULL,3,'Dienste',NULL),(7,NULL,4,'Daten',NULL),(8,1,1,'Dokumentierte Geschäfts-Strategien und -Politik',NULL),(9,1,2,'Dokumentierte Prozesse',NULL),(10,1,3,'Dokumentierte Dienste',NULL),(11,1,4,'Dokumentierte Datenmodelle',NULL),(12,2,1,'Grundlegende ICT Infrastruktur und Plattform',NULL),(13,2,2,'ICT Support für Prozesse, der ad hoc Prozess-Informationsaustausch ermöglicht',NULL),(14,2,3,'Verknüpfbare Dienste und Applilkationen, die ad hoc Informationsaustausch ermöglichen',NULL),(15,2,4,'Verknüpfbare Datenspeicherung, die einfachen elektronischen Austausch ermöglicht',NULL),(16,3,2,'Definierte und etablierte Organisationsstrukturen, sowie identifizierte Verantwortlichkeiten und Authoritäten',NULL),(17,3,3,'Definierte und etablierte Organisationsstrukturen, sowie identifizierte Verantwortlichkeiten und Authoritäten',NULL),(18,3,4,'Definierte und etablierte Organisationsstrukturen, sowie identifizierte Verantwortlichkeiten und Authoritäten',NULL),(19,3,1,'-',NULL);
/*!40000 ALTER TABLE `mmei_matrix` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `set_has_label`
--

DROP TABLE IF EXISTS `set_has_label`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `set_has_label` (
  `indicator_set_id` int(11) NOT NULL,
  `set_label_id` int(11) NOT NULL,
  PRIMARY KEY (`indicator_set_id`,`set_label_id`),
  KEY `has_label_label_id_idx` (`set_label_id`),
  CONSTRAINT `has_label_label_id` FOREIGN KEY (`set_label_id`) REFERENCES `set_label` (`set_label_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `has_label_set_fk` FOREIGN KEY (`indicator_set_id`) REFERENCES `indicator_set` (`indicator_set_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `set_has_label`
--

LOCK TABLES `set_has_label` WRITE;
/*!40000 ALTER TABLE `set_has_label` DISABLE KEYS */;
/*!40000 ALTER TABLE `set_has_label` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `set_in_assessment`
--

DROP TABLE IF EXISTS `set_in_assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `set_in_assessment` (
  `indicator_set_id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  PRIMARY KEY (`assessment_id`,`indicator_set_id`),
  KEY `in_assessment_set_fk_idx` (`indicator_set_id`),
  CONSTRAINT `in_assessment_assessment_id` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `in_assessment_set_fk` FOREIGN KEY (`indicator_set_id`) REFERENCES `indicator_set` (`indicator_set_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `set_in_assessment`
--

LOCK TABLES `set_in_assessment` WRITE;
/*!40000 ALTER TABLE `set_in_assessment` DISABLE KEYS */;
INSERT INTO `set_in_assessment` VALUES (3,4),(4,4);
/*!40000 ALTER TABLE `set_in_assessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `set_label`
--

DROP TABLE IF EXISTS `set_label`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `set_label` (
  `set_label_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_group_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`set_label_id`),
  KEY `set_label_group_fk_idx` (`user_group_id`),
  CONSTRAINT `set_label_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `set_label`
--

LOCK TABLES `set_label` WRITE;
/*!40000 ALTER TABLE `set_label` DISABLE KEYS */;
/*!40000 ALTER TABLE `set_label` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `state`
--

DROP TABLE IF EXISTS `state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `state` (
  `state_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`state_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `state`
--

LOCK TABLES `state` WRITE;
/*!40000 ALTER TABLE `state` DISABLE KEYS */;
INSERT INTO `state` VALUES (1,'Entwurf',NULL),(2,'Wird geprüft',NULL),(3,'Ungeprüft',NULL),(4,'Geprüft',NULL);
/*!40000 ALTER TABLE `state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_role_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `role_fk_idx` (`user_role_id`),
  CONSTRAINT `user_role_fk` FOREIGN KEY (`user_role_id`) REFERENCES `user_role` (`user_role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,3,'Admin','ad@min','$2a$06$/A.CIdWYYtFUaJpv5QU4Eu/rAXjQYGGwoK2ROiifkWXSdr8EPr9iS','2016-11-02 15:31:18'),(2,5,'Experte','be0schwarz@gmail.com','$2a$10$yd1cltnNBt4EXzqZjdB5I.sZbfAR.1n7U7U6Td8GzzJlGeN1zkkJ6','2016-11-02 15:53:15'),(4,4,'Auditor','be0schwarz@gmail.com','$2a$10$iZjM7sKpP8/3SuJdBi22zOYH1jaKflVlLWk.x/lNn/teHQfGAWzzm','2016-11-03 17:27:41'),(5,2,'ÖNutzer','be0schwarz@gmail.com','$2a$10$8qzw5STHoGCReIfhoeyOZO/4NkPzwm5kdnOMyJA4SZ16Y60A8UVFq','2016-11-04 01:04:14');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_candidate`
--

DROP TABLE IF EXISTS `user_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_candidate` (
  `user_candidate_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_role_id` int(11) NOT NULL,
  `user_group_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email_sent` timestamp NULL DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `registered` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_candidate_id`),
  UNIQUE KEY `token_UNIQUE` (`token`),
  KEY `user_candidate_role_fk_idx` (`user_role_id`),
  KEY `user_group_fk_idx` (`user_group_id`),
  CONSTRAINT `user_candidate_role_fk` FOREIGN KEY (`user_role_id`) REFERENCES `user_role` (`user_role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_candidate`
--

LOCK TABLES `user_candidate` WRITE;
/*!40000 ALTER TABLE `user_candidate` DISABLE KEYS */;
INSERT INTO `user_candidate` VALUES (2,5,NULL,'be0schwarz@gmail.com','2016-11-02 15:52:03','2016-11-02 15:53:16','7e633aec-975c-442d-b800-39495d5e837e',1),(4,4,NULL,'be0schwarz@gmail.com','2016-11-03 17:26:39','2016-11-03 17:27:42','14f5500e-9750-48ae-b9c2-6e3255ddd699',1),(5,2,NULL,'be0schwarz@gmail.com','2016-11-04 00:22:02','2016-11-04 01:04:15','d717c128-da18-4a21-8ccc-e5fdda99605c',1);
/*!40000 ALTER TABLE `user_candidate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_group` (
  `user_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group`
--

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
INSERT INTO `user_group` VALUES (2,'Auditoren','','2016-11-04 01:29:41'),(3,'Experten','','2016-11-04 01:29:52');
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_in_group`
--

DROP TABLE IF EXISTS `user_in_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_in_group` (
  `user_group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`user_group_id`,`user_id`),
  KEY `user_fk_idx` (`user_id`),
  CONSTRAINT `in_group_group_fk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`user_group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `in_group_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_in_group`
--

LOCK TABLES `user_in_group` WRITE;
/*!40000 ALTER TABLE `user_in_group` DISABLE KEYS */;
INSERT INTO `user_in_group` VALUES (3,2),(2,4);
/*!40000 ALTER TABLE `user_in_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_role` (
  `user_role_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `user_role_name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES (1,'Privater Nutzer',NULL),(2,'Öffentlicher Nutzer',NULL),(3,'Admin',NULL),(4,'Auditor',NULL),(5,'Experte',NULL);
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visibility`
--

DROP TABLE IF EXISTS `visibility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visibility` (
  `visibility_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `visible` tinyint(4) NOT NULL,
  PRIMARY KEY (`visibility_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visibility`
--

LOCK TABLES `visibility` WRITE;
/*!40000 ALTER TABLE `visibility` DISABLE KEYS */;
INSERT INTO `visibility` VALUES (1,'Nicht sichtbar',NULL,0),(2,'Öffentlich',NULL,1);
/*!40000 ALTER TABLE `visibility` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-11-04  4:06:43
