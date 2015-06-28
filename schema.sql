create table if not exists users (
  id varchar(32),
  name varchar(128),
  accessToken varchar(256),
  primary key (id)
);
create table if not exists genre (
  id mediumint unsigned not null auto_increment,
  name varchar(128),
  primary key (id)
);
create table if not exists groups (
  id mediumint unsigned not null auto_increment,
  name varchar(128),
  genre_id mediumint unsigned,
  primary key (id)
);
create table if not exists events (
  id mediumint unsigned not null auto_increment,
  creator_id mediumint unsigned,
  start_time timestamp,
  longitude float,
  latitude float,
  name varchar(128),
  image_url varchar(256),
  primary key (id)
);
create table if not exists user_events (
  user_id varchar(32),
  event_id mediumint unsigned,
  primary key (user_id, event_id)
);
create table if not exists group_events (
  group_id mediumint unsigned,
  event_id mediumint unsigned,
  primary key (group_id, event_id)
);
