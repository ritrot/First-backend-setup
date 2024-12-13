    
1] const avatarpath = req.files?.avatar[0]?.path;
    => delete the file in postmon and send again.

2] use x-www-form-urlencode for normal routes such as the login and use formdata from register routes since it requires the files to upload.


3] the error is the refresh token that we are creating have the diffrent secreate than that of we stored in the env so when jwt try to verfiy it it shows the erroe invalid signature  => it is solved we were providing the refreah token and trying to comapre with access token so we just replaced the secret of acess with secret of refresh .

4] if we are trying to get the user from the req then first we have to login that means firstly hit post in login then start the rest process. It will create refresh token and add it to the data base and it will be deleted in 10 days since we kept 10 days as expiry date.


5] the problem is the change password route is not accepting the methods from model - the user doest have the id = decodeinfo have the id but the user dont => i forgot to give the await to the  {const user =await User.findById(decodedinfo._id);}

6] The FullName is not changing in the database from update detail. => i made spelling mestike while wrting the name fullName i wrote fullname.

7] The user do not have the files or the file => we had to add{ upload.single("coverImage") } at the route to accept the file 

8] In getChannelProfile i was passing :username but it was /username how? it should be : right?