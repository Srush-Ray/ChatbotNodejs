# import sys
# print(" hey from python script you sent",
#       sys.argv[1], ' from nodejs which is of lenght', len(sys.argv[1]))
#########################################################
# from nltk.corpus import stopwords
# from gensim import corpora
# import gensim
# import nltk
# from nltk.tokenize import sent_tokenize
# from nltk.tokenize import word_tokenize
# from django.db.models import Q
# from .data_analysis import text_mining
# from django.core import serializers
# from Admin.models import Query_table
# from channels.generic.websocket import WebsocketConsumer
# from asgiref.sync import async_to_sync
# import json
# print(" hey from python script you sent",sys.argv[1], ' from nodejs which is of lenght', len(sys.argv[1]))
#from .Similarity import demo
import sys
# import psycopg2
print("Opened database successfully")


# class ChatConsumer(WebsocketConsumer):
#     asked_question = " "

#     def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = 'chat_%s' % self.room_name

#         # Join room group
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,
#             self.channel_name
#         )

#         self.accept()

#     def disconnect(self, close_code):
#         # Leave room group
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name,
#             self.channel_name
#         )

#     # Receive message from WebSocket
#     def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         self.asked_question = text_data_json['message']
#         flag = text_data_json['flag']
#         message = text_data_json['message']
#         ans = 'not found'
#         ans_id = ''

#         if flag == 0:
#             print("In flag =0")
#             t = None
#             find_name = text_mining(message)
#             name = find_name.identify_name()

#             if(name == '0'):
#                 name = 'User'
#                 flag = 2
#             # Send message to room group
#             async_to_sync(self.channel_layer.group_send)(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'flag': flag,
#                     'answer': name,
#                     'ans_id': ans_id,
#                     'q': self.asked_question
#                 }
#             )

#         if flag == 1:
#             t = None
#             #obj = demo()
#             que_list = []
#             ans_list = []
#             id_list = []

#             for p in Query_table.objects.raw('select * from "Admin_query_table"'):
#                 que_list.append(p.quesion)
#                 ans_list.append(p.answer)
#                 id_list.append(p.id)

#             file2_docs = []

#             gen_docs = [[w.lower() for w in word_tokenize(text)]
#                         for text in que_list]
#             dictionary = gensim.corpora.Dictionary(gen_docs)
#             corpus = [dictionary.doc2bow(gen_doc) for gen_doc in gen_docs]
#             tf_idf = gensim.models.TfidfModel(corpus)
#             sims = gensim.similarities.Similarity(
#                 None, tf_idf[corpus], num_features=len(dictionary))

#             tokens = sent_tokenize(self.asked_question)
#             for line in tokens:
#                 file2_docs.append(line)

#             for line in file2_docs:
#                 query_doc = [w.lower() for w in word_tokenize(line)]
#                 query_doc_bow = dictionary.doc2bow(query_doc)

#             query_doc_tf_idf = tf_idf[query_doc_bow]
#             similarity_list = sims[query_doc_tf_idf]
#             sims.destroy()

#             max_similarity = max(similarity_list)

#             similarity_list = similarity_list.tolist()
#             max_similarity_index = similarity_list.index(max_similarity)

#             ans = ans_list[max_similarity_index]
#             ans_id = id_list[max_similarity_index]

#             hold = Query_table.objects.get(id=ans_id)
#             hold.viewed = hold.viewed + 1
#             hold.save()
#             # obj.freememory()
#             # Send message to room group
#             async_to_sync(self.channel_layer.group_send)(

#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'flag': flag,
#                     'answer': ans,
#                     'ans_id': ans_id,
#                     'q': self.asked_question
#                 }

#             )

#     # Receive message from room group
#     def chat_message(self, event):
#         ans = event['answer']
#         flag = event['flag']
#         ans_id = event['ans_id']

#         # Send message to WebSocket
#         self.send(text_data=json.dumps({
#             'type': 'chat_message',
#             'flag': flag,
#             'answer': ans,
#             'ans_id': ans_id,
#             'q': self.asked_question
#         }))
