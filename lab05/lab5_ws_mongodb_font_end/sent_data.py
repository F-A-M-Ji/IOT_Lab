import paho.mqtt.client as mqtt
import time


# กำหนด MQTT broker และ port
MQTT_BROKER = "04b676ae30984df98cdf25ea13faaadf.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_TOPIC = ["pump","envs"]


# Callback เมื่อเชื่อมต่อสำเร็จ
def on_message(client, userdata, msg):
    print("Received message: "+msg.payload.decode())

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code "+str(rc))
    client.subscribe(MQTT_TOPIC[0])
def con_mqtt():
    client = mqtt.Client()
    

    # กำหนด callback function เมื่อเชื่อมต่อสำเร็จ
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(username="hivemq.webclient.1710070635593", password="ecS.7R8Y:39hUvDC#r%n")
    client.tls_set()
    # เชื่อมต่อไปยัง MQTT broker ผ่าน port ที่กำหนด
    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    return client

def publish(client):
    cnt = 90
    time.sleep(1)
    if(cnt == 100):
        cnt = 0
    else:
        cnt +=1

    msg = f"{cnt+1},{cnt+2},{cnt+3},{cnt+4},{cnt+5}"
    msg_1 = f"{cnt+10}"
    result = client.publish(MQTT_TOPIC[1], msg)
    result = client.publish(MQTT_TOPIC[0], msg_1)
        # print(client.on_message)
    print(cnt)
        
def run():
    
    client = con_mqtt()
    # publish(client)
    client.loop_forever()
    

if __name__ == "__main__":
    run()



