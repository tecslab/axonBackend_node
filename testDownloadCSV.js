
client.connect(function () {
    client.download('/public_html/test', 'test2/', {
        overwrite: 'all'
    }, function (result) {
        console.log(result);
    });
 
});