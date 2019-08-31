// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const SerialPort = require('serialport')
const createTable = require('data-table')
const Readline = require('@serialport/parser-readline')
const fs = require('fs');
var file;
var portName;
const swal = require('sweetalert')

SerialPort.list((err, ports) => {
    console.log('ports', ports);
    if (err) {
        document.getElementById('error').textContent = err.message
        return
    } else {
        document.getElementById('error').textContent = ''
    }

    if (ports.length === 0) {
        document.getElementById('error').textContent = 'No ports discovered'
    }

    const portsDropdown = document.getElementById('ports')
    ports.forEach(port => {
        const portName = port['comName']
        console.log(portName)
        portsDropdown.options[portsDropdown.options.length] = new Option(portName, portName)
    })
})

document.getElementById("refresh").addEventListener('click', function () {
    location.reload()
})

document.getElementById("clear").addEventListener('click', function () {
    document.getElementById("outputSerialMonitor").textContent = ""
})

document.getElementById("save").addEventListener('click', function () {
    var content = document.getElementById("outputSerialMonitor").textContent
    console.log(content)
    try { fs.writeFileSync(file, content, 'utf-8'); swal('Saved!', 'Saved to file: ' +file, 'success')}
    catch (e) { swal('Error', 'Failed to save the file to: '+file, 'error'); }
})

document.addEventListener('DOMContentLoaded', function () {
    var btnStart = document.getElementById('start');

    btnStart.addEventListener('click', function () {
        portName = document.getElementById('ports').value;
        file = document.getElementById('outputFileNameInput').value;
        console.log("port: " + portName + " file:" + file)
        if (file.length == 0) {
            document.getElementById('fileNameError').textContent = 'Please enter a filename.'
            return;
        } else {
            // loading spinner
            document.getElementById("form").style.display = "none"
            document.getElementById("serialmonitor").style.display = "none"
            document.getElementById("loading").style.display = "block"
            try {
                const port = new SerialPort(portName, {
                    baudate: 9600
                })
                console.log("Reading...")
                const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
                // load serial monitor
                document.getElementById("form").style.display = "none"
                document.getElementById("serialmonitor").style.display = "block"
                document.getElementById("loading").style.display = "none"
                parser.on('data', data => {
                    //console.log(data)
                    document.getElementById("outputSerialMonitor").textContent += data + "\n"
                })

            } catch(error) {
                swal('Error', error.message, 'error')
                location.reload()
            }
        }
    })
});