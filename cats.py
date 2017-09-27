from keras.applications.vgg16 import VGG16
from keras.preprocessing import image
from keras.applications.vgg16 import preprocess_input
from keras.applications.imagenet_utils import decode_predictions

import numpy as np
import argparse

parser = argparse.ArgumentParser(description='Cat detector with Keras.')
parser.add_argument('image_path', metavar='base', type=str,
		help='Path to the image with(out) a cat')

args = parser.parse_args()
img_path = args.image_path # 'img/cat1.jpg'

model = VGG16(weights='imagenet', include_top=True)

# img_path = 'img/cat1.jpg'
img = image.load_img(img_path, target_size=(224, 224))
# img = preprocess_image(img_path)

x = image.img_to_array(img)
x = np.expand_dims(x, axis=0)
x = preprocess_input(x)

features = model.predict(x)
result = decode_predictions(features)

print(result)

