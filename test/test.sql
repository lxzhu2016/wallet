delete from wallet_transaction;
delete from wallet_account;
delete from wallet_account_category;
delete from wallet_person;
delete from wallet_user;
delete from wallet_account_type;

alter table wallet_transaction auto_increment = 1;
alter table wallet_account auto_increment = 1;
alter table wallet_account_category auto_increment = 1;
alter table wallet_person auto_increment = 1 ;
alter table wallet_user auto_increment = 1;

insert into wallet_account_type(account_type_id, account_type_name,
	description,sys_created_on)
values 
	(1,N'Assets',N'',now()),
	(2,N'Debt',N'',now()),
	(3,N'Balance',N'',now());

insert into wallet_user(user_id, username, password, sys_created_on)
values
	(1,N'john',upper(md5('john@gmail.com')),now()),
	(2,N'adela',upper(md5('adela@gmail.com')),now());

insert into wallet_person(person_id, user_id, first_name, last_name,
	email, mobile, is_user, sys_created_on)
values 
	(1,1,'john','black','john@gmail.com','+8615812345678',1,now()),
	(2,1,'smith','black','smith@gmail.com','',0,now()),
	(3,1,'annie','black','annie@gmail.com','',0,now()),
	(4,2,'adela','white','adela@gmail.com','',1,now()),
	(5,2,'david','white','david@gmail.com','',1,now());

insert into wallet_account_category(account_category_id, user_id,
	account_category_name,description,sys_created_on)
values
	(1,1,'unknown','',now()),
	(2,1,'book','',now()),
	(3,1,'meals','',now()),
	(4,1,'salary','',now()),
	(5,2,'stock','',now()),
	(6,2,'salary','',now());
	


