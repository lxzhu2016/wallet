
$(document).ready(function() {
	$('#btn-create-user').click(function() {
		$.ajax('/api/create_user', {
			contentType:'application/json',
			dataType:'json',
			method:'post',
			data : JSON.stringify({
				username : $('#username').val(),
				password : $('#password').val(),
				firstName : $('#firstName').val(),
				lastName : $('#lastName').val(),
				mobile : $('#mobile').val(),
				email : $('#email').val()
			}),
			success : function(data, status, xhr) {
				alert(data);
			}
		});
	});
});