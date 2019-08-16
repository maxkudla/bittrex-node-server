const express = require('express');
const http = require('http');
const cors = require('cors')
const socket = require('socket.io');
const bittrex = require('node-bittrex-api');

const app = express();
const server = http.createServer(app);
const io = socket(server, { origins: '*:*'});


app.use(cors());

server.listen(3000, function(){
    console.log('server is listening on 3000 port');

    io.on('connection', function(socket){
        console.log('user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });

    bittrex.getmarketsummaries( function( data, err ) {
        if (err) {
            return console.error(err);
        }
        const markets = data.result.map(({MarketName}) => MarketName);

        bittrex.websockets.listen(function(data, client) {
            if (data.M === 'updateSummaryState') {
                data.A.forEach(function(data_for) {
                    data_for.Deltas.forEach(function(marketsDelta) {
                        io.emit('update_summary_state', marketsDelta);
                    });
                });
            }
        });

        // bittrex.websockets.client(function() {
        //     console.log('bittrex connected');
        //     bittrex.websockets.subscribe(markets, function(data) {
        //         if (data.M === 'updateExchangeState') {
        //             data.A.forEach(function(data_for) {
        //                 io.emit('update_exchange_state', data_for);
        //             });
        //         }
        //     });
        // });
    });
});







