from keras.applications.vgg16 import VGG16
from keras.preprocessing import image
from keras.applications.vgg16 import preprocess_input
from keras.applications.imagenet_utils import decode_predictions

import os.path

import sys
import numpy as np
import argparse

parser = argparse.ArgumentParser(description='Cat detector with Keras.')
parser.add_argument('-i', '--image', metavar='base', type=str,
		help='Path to the image with(out) a cat')

args = parser.parse_args()
img_path = args.image # 'img/cat1.jpg'

def calculate(img_path):
	model = VGG16(weights='imagenet', include_top=True)

	# img_path = 'img/cat1.jpg'
	img = image.load_img(img_path, target_size=(224, 224))
	# img = preprocess_image(img_path)

	x = image.img_to_array(img)
	x = np.expand_dims(x, axis=0)
	x = preprocess_input(x)

	features = model.predict(x)
	return decode_predictions(features)

# print("img path: " + str(img_path))
if img_path:
	result = calculate(img_path)
	print(result)

# print("No image given, entering dynamic mode")
for line in sys.stdin:
	line = line.strip("\n")
	try:
		result = calculate(line) # "catpics/img/cat1.jpg")
		print(result)
		sys.stdout.flush()

	except (FileNotFoundError, IsADirectoryError):
		# print("no file:" + line + ":")
		continue
	else:
		# print("error")
		continue
	#
	# if not os.path.exists(line):
	# 	print("No file: " + line)
	# 	continue

exit();
