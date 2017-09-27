Is It Cat?
=========================

This is the source code for the bot, who runs on AWS servers. The setup is: Keros on Tensorflow, python3 and nodejs.

To run, if everything else is set up,

    npm install
    npm run start
    
This implies you have installed all the needed python binaries.

Every picture send to the bot, he saves into `public/photos` directory.

Be careful, `exec` call is greatly unoptimized, you should not do this in production. Needs much refactoring.
