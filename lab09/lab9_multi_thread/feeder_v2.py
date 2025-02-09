# python3.6

import random
import schedule
import multiprocessing
import time
from paho.mqtt import client as mqtt_client

config=["OFF","L1","53","54","55","N","N","N"]


broker = 'm15.cloudmqtt.com'
port = 12987
client_id = f'python-mqtt-{random.randint(0, 1000)}'
username = 'cyejnmdr'
password = 'Is7roaqnQX09'
MQTT_TOPIC = [("FEED",0),("CFG",0),("ONTIMER",0),("READ",0),("SFS",0)]

jobs = []
def feed():
    print("I'm working...")
    
def test_feed():
    i=0
    while(1):
       print("I'm working...",i)
       i=i+1
       time.sleep(1)
       
def feedProcess():
    f = open("config.cfg", "r")
    current_config_text=f.read()
    f.close()
    config=current_config_text.split()
    if(config[2]!='N'):
       t1="10:"+config[2]
       schedule.every().day.at(t1).do(feed)
    if(config[3]!='N'):
       t2="10:"+config[3]
       schedule.every().day.at(t2).do(feed)
    if(config[4]!='N'):
       t3="10:"+config[4]
       schedule.every().day.at(t3).do(feed)
   
    #schedule.clear()
    #schedule.run_all() 
    while True:
       schedule.run_pending()
       time.sleep(1)


def connect_mqtt() -> mqtt_client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client
def publish(client):
    msg_count = 0
    
    topic="CURRENTCFG"
    
    f = open("config.cfg", "r")
    current_config_text=f.read()
    print(current_config_text)
    f.close()  
    current_config=current_config_text.split(' ')
    print(current_config)
    current_config_ontimer  =",".join(current_config[2:7])
    result = client.publish("FEED", current_config[0])
    result = client.publish("CFG", current_config[1])
    result = client.publish("ONTIMER", current_config_ontimer)
    result = client.publish("CURRENTCFG", current_config_text)
    # result: [0, 1]
    status = result[0]
    if status == 0:
       print(f"Send `{current_config_text}` to topic `{topic}`")
    else:
       print(f"Failed to send message to topic {topic}")

def subscribe(client: mqtt_client):
    def on_message(client, userdata, msg):
       print(f"Received1111 `{msg.payload.decode()}` from `{msg.topic}` topic")
       data_recv=msg.payload.decode()
       print(data_recv)
       ##read Configure
       print("AAAA")
       if(msg.topic=='FEED'):
          f = open("config.cfg", "r")
          current_config_text=f.read()
          print("RRRR")
          print(current_config_text)
          f.close()
          #write configure
          f = open("config.cfg", "w")
          config=current_config_text.split() 
          config[0]=msg.payload.decode()
          config_text=" ".join(config)
          f.write(config_text)
          f.close()
       if(msg.topic=='CFG'):
          f = open("config.cfg", "r")
          current_config_text=f.read()
          print("RRRR")
          print(current_config_text)
          f.close()
          #write configure
          f = open("config.cfg", "w")
          config=current_config_text.split() 
          config[1]=msg.payload.decode()
          config_text=" ".join(config)
          f.write(config_text)
          f.close()
       if(msg.topic=='ONTIMER'):
          f = open("config.cfg", "r")
          current_config_text=f.read()
          print("OOOORRRR")
          print(current_config_text)
          f.close()
          #write configure
          f = open("config.cfg", "w")
          config=current_config_text.split()
          temp=msg.payload.decode()
          ontimer=temp.split(',')
          temp_ontimer=['N','N','N','N','N','N']
          i=0
          for x in ontimer:
             temp_ontimer[i]=x
             i=i+1
          config[2]= temp_ontimer[0]
          config[3]= temp_ontimer[1]
          config[4]= temp_ontimer[2]
          config[5]= temp_ontimer[3]
          config[6]= temp_ontimer[4]
          config[7]= temp_ontimer[5]
          config_text=" ".join(config)
          f.write(config_text)
          f.close()
       if(msg.topic=='SFS'):
          if(msg.payload.decode()=='ON'):
            print("Start Feeding Scheduler")
       	    p2 = multiprocessing.Process(name='p2', target=feedProcess)
            p2.start()
            jobs.append(p2)
          if(msg.payload.decode()=='OFF'):
            print("terminate")
            for i in jobs:
                #Terminate each process
                i.terminate()
            #p2.kill()
       if(msg.topic=='READ'):
          publish(client)
       
          
    client.subscribe(MQTT_TOPIC)
    client.on_message = on_message
 


def run():
    f = open("config.cfg", "w")
    config_text=" ".join(config)
    f.write(config_text)
    f.close()
    client = connect_mqtt()
    subscribe(client)
    print("O1111")
    client.loop_forever()
    
    print("OOO")
    


if __name__ == '__main__':
    p1 = multiprocessing.Process(name='p1', target=run)
    
    p1.start()
    

