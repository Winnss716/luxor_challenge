PGDMP          
            }           luxor_challenge    17.0    17.0 !    =           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            >           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            ?           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            @           1262    72043    luxor_challenge    DATABASE     �   CREATE DATABASE luxor_challenge WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE luxor_challenge;
                     postgres    false                        3079    72044    pgcrypto 	   EXTENSION     <   CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
    DROP EXTENSION pgcrypto;
                        false            A           0    0    EXTENSION pgcrypto    COMMENT     <   COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
                             false    2                       1255    72081    hash_user_password()    FUNCTION     o  CREATE FUNCTION public.hash_user_password() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- Only hash if the password is not already hashed (avoid double-hashing on updates)
    IF NEW.password IS NOT NULL AND NEW.password !~ '^\$2[ayb]\$.{56}$' THEN
        NEW.password := crypt(NEW.password, gen_salt('bf', 10));
    END IF;
    RETURN NEW;
END;
$_$;
 +   DROP FUNCTION public.hash_user_password();
       public               postgres    false                       1255    72135    hash_user_pin()    FUNCTION     g  CREATE FUNCTION public.hash_user_pin() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.login_pin IS NOT NULL THEN
        IF LENGTH(NEW.login_pin) != 4 THEN
            RAISE EXCEPTION 'login_pin must be exactly 4 characters';
        END IF;
        NEW.login_pin := crypt(NEW.login_pin, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$;
 &   DROP FUNCTION public.hash_user_pin();
       public               postgres    false                       1255    72165    set_status_pending()    FUNCTION     �   CREATE FUNCTION public.set_status_pending() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status IS NULL THEN
        NEW.status := 'pending';
    END IF;
    RETURN NEW;
END;
$$;
 +   DROP FUNCTION public.set_status_pending();
       public               postgres    false            �            1259    72082    bids    TABLE     �  CREATE TABLE public.bids (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id integer NOT NULL,
    price numeric NOT NULL,
    user_id uuid NOT NULL,
    status text NOT NULL,
    number_bids numeric NOT NULL,
    date timestamp with time zone NOT NULL,
    CONSTRAINT status_check CHECK (((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text])) OR (status IS NULL)))
);
    DROP TABLE public.bids;
       public         heap r       postgres    false            �            1259    72089    collections    TABLE     �   CREATE TABLE public.collections (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    stocks numeric NOT NULL,
    price numeric NOT NULL
);
    DROP TABLE public.collections;
       public         heap r       postgres    false            �            1259    72094    collections_id_seq    SEQUENCE     �   ALTER TABLE public.collections ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.collections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    219            �            1259    72152    owner    TABLE     �   CREATE TABLE public.owner (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    password character varying(255) NOT NULL
);
    DROP TABLE public.owner;
       public         heap r       postgres    false            �            1259    72095    user    TABLE       CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    password character varying(255) NOT NULL,
    login_pin character varying(255) NOT NULL
);
    DROP TABLE public."user";
       public         heap r       postgres    false            6          0    72082    bids 
   TABLE DATA           \   COPY public.bids (id, collection_id, price, user_id, status, number_bids, date) FROM stdin;
    public               postgres    false    218   *       7          0    72089    collections 
   TABLE DATA           K   COPY public.collections (id, name, description, stocks, price) FROM stdin;
    public               postgres    false    219   ��       :          0    72152    owner 
   TABLE DATA           D   COPY public.owner (id, name, email, username, password) FROM stdin;
    public               postgres    false    222   ��       9          0    72095    user 
   TABLE DATA           P   COPY public."user" (id, name, email, username, password, login_pin) FROM stdin;
    public               postgres    false    221   ��       B           0    0    collections_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.collections_id_seq', 103, true);
          public               postgres    false    220            �           2606    72102    bids bids_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.bids DROP CONSTRAINT bids_pkey;
       public                 postgres    false    218            �           2606    72104    collections collections_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.collections DROP CONSTRAINT collections_pkey;
       public                 postgres    false    219            �           2606    72159    owner owner_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.owner
    ADD CONSTRAINT owner_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.owner DROP CONSTRAINT owner_pkey;
       public                 postgres    false    222            �           2606    72106    user unique_email 
   CONSTRAINT     O   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT unique_email UNIQUE (email);
 =   ALTER TABLE ONLY public."user" DROP CONSTRAINT unique_email;
       public                 postgres    false    221            �           2606    72161    owner unique_owner_email 
   CONSTRAINT     T   ALTER TABLE ONLY public.owner
    ADD CONSTRAINT unique_owner_email UNIQUE (email);
 B   ALTER TABLE ONLY public.owner DROP CONSTRAINT unique_owner_email;
       public                 postgres    false    222            �           2606    72163    owner unique_owner_username 
   CONSTRAINT     Z   ALTER TABLE ONLY public.owner
    ADD CONSTRAINT unique_owner_username UNIQUE (username);
 E   ALTER TABLE ONLY public.owner DROP CONSTRAINT unique_owner_username;
       public                 postgres    false    222            �           2606    72108    user unique_username 
   CONSTRAINT     U   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT unique_username UNIQUE (username);
 @   ALTER TABLE ONLY public."user" DROP CONSTRAINT unique_username;
       public                 postgres    false    221            �           2606    72110    user user_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_pkey;
       public                 postgres    false    221            �           2620    72164    owner trigger_hash_password    TRIGGER     �   CREATE TRIGGER trigger_hash_password BEFORE INSERT OR UPDATE OF password ON public.owner FOR EACH ROW EXECUTE FUNCTION public.hash_user_password();
 4   DROP TRIGGER trigger_hash_password ON public.owner;
       public               postgres    false    222    259    222            �           2620    72111    user trigger_hash_password    TRIGGER     �   CREATE TRIGGER trigger_hash_password BEFORE INSERT OR UPDATE OF password ON public."user" FOR EACH ROW EXECUTE FUNCTION public.hash_user_password();
 5   DROP TRIGGER trigger_hash_password ON public."user";
       public               postgres    false    221    259    221            �           2620    72136    user trigger_hash_pin    TRIGGER     �   CREATE TRIGGER trigger_hash_pin BEFORE INSERT OR UPDATE OF login_pin ON public."user" FOR EACH ROW EXECUTE FUNCTION public.hash_user_pin();
 0   DROP TRIGGER trigger_hash_pin ON public."user";
       public               postgres    false    260    221    221            �           2620    72166    bids trigger_set_status_pending    TRIGGER     �   CREATE TRIGGER trigger_set_status_pending BEFORE INSERT OR UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.set_status_pending();
 8   DROP TRIGGER trigger_set_status_pending ON public.bids;
       public               postgres    false    218    261            �           2606    72112    bids bids_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.bids DROP CONSTRAINT bids_user_id_fkey;
       public               postgres    false    218    221    4760            �           2606    72117    bids collection_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.bids
    ADD CONSTRAINT collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE CASCADE;
 A   ALTER TABLE ONLY public.bids DROP CONSTRAINT collection_id_fkey;
       public               postgres    false    218    219    4754            6      x���K,��6.���2|��_�&4��;��ꬣ�P�H�׼�]q2�p�����nÕ[l����B�R^��T�{ٗ��m���Խq�
U�钮�^>�R�ڪ�Jk��ߣ���.#�I�ú?������2���j���/�K�d�)��W�El�FR7�E��CL�9F���_bs��x�j��9�������������5���B��[���iq��\�PB�d��hz��޴�dRx��l����������o���O:��m���^%��z�+i�ל�����Cx�9����mk�+�?>�sʢ�m�ƹ�.�/ьy���v|���e;���m��s��������L/9�����J��K�ȭ���.�N�-��v��s��Ǚ?>��yc�m��!}*΍��t�.�j!�84H1/��-���޶������s�V��X��G�ኍ~u+��\$g�m�o������;���c��H�Ѹ�ZR	�*wE,>E���Z߃���}|;wf�=>�_/ݿ�$��a������ʵ���֯�wp�o�ZJW��zp��)~m;�qЭ{G���P�e{E?6��J	�:���C��e�*���m�#�<�h�%����|��T��+�nKlŴ<^_��;|����6���ZYc�>�qD3�N�1��❛
+e̢�k�h;�}k��y�5��lSL�s_��zu���	�<wy8�(17W'M[�r����n�m�ذι�x��k�r���r����1Xh<���S��s[:U�߈�'��YK&{�8�Iܠs1W6����75�67���ȿD�4��x	���O>�c�d�����)^xj���j}����z8�dAE�E�^�{p�m�x�2�UF-����h�E)��x��k��ӆ�<�p�W��8��{�?#�㖥h]�������������[�Q�q3��@���|:<�o�#9���+�n]ї��g����a�^��[�����8�q��X���7��k�8�E�����w-ki\`����q�?J��Ѐ8j7r�ֵ<$�Z�St4b\����m2��s���+<��N]ĺ�������ۈ/#�ښ��ia=8p�?<oO��fV�Z��u�}�-���czq���(N��Vږ(�tx���"�ӿ����=�4�v��зz�6�n�h�'m'�C_?7����ǚ7\Gt+�D��a�5��Fs�����3�Y���{�W�����'7�t��ace1�!��q�m���� (9�\r�g��D����:����88��`b�GuWD� ,N[QP��^p�y����O|z��	)�X9�Kb�Iw��Õ��>�� ������X�� �r_�'V72o�I�˶o�w��4��`��-�:�*	Ӳ]>�(�㖉#t��y�p�����\�▅�C��`f�l��Ó�xq�6M9ɲZ�`�o�g��^5x{50�h[��ȳ&o��#������������#�҈/�d�6�E�Xk4i���DO��A�{+P#Κ�n}oW�D,�Y����K��1��/�U��68�C�����`U�S�6��e̔�o�Q�r'Gp��SI��Ѹ�g�|q�.@��*���f�Rr'�J	\��H�0��A<�B��\�KVP���k��7�l����FO"&U�
n_1�=<�O�.\�m�h7x1��@f�m��a�O-P��T����~I�vb�#�[��C�38��LqU�l��� p�3�I��mG��Y�;�I��%o�*�t�@�E8�i�<Ԧ��0���zNğ��ӡ#�����ۛ�>Np��
`*%��ѻg�y���^!��Bb�?�1[�7Rn��2�A�R	�M�;��R�8C��}}��a{9U��I�T�
>��sG���V*��0 ζg��xU86�`Go #����zA15_�J��x�	��LKv�{{|rsl;<޹�c��C��[,Y7`�U'�9�ԕ�w����cʹ�DO��3�F�od��S�>)�i��K5.Z�|�
��*��b$����1i�Ec��\�A5%\�Va&0\(�Eg��4�'/��$6joH� dt0!����R:�[j����{�C�$�}n8�6�p�j����3<�@W��Og6�v2a��x�����q�x���y�M�� �uFQ�W-s� �@���2�x���q�2S���
��݆lp�`%�	���mE��k��� :�O�)𤃔	�Ng�m(�6.�(�x�?��5f��j�K����г}���+�=\��;���c3���j��*'�Ҁ�	@�1�^h��mq�	3�'@���7?�E�[=�����=Є��v�'<{[/ݟg^�㹅e�JkC�s}��p����c
rT���I 7�:�tP#w������t�"��M�����F�,�5�/���h<��&�9FK�B�f�v��<�4��	��酄0\!����v�m��;�t����I���Ʌ;�'v��q�R�L8ēBB^�����mb����)ß����KV��t�DGlt�������J�M����������-������x���͘�? ��,.�:�O��{���r���= f��M4ߩ��Z#��&n�\2���·�ж$9��I���Xk�?ى|߁�����Y�z���fX Q�y�밁H��V(%���͝Z�ޖ���&-R>VL��k(���Y^o�{�����:l& �:�uƯ�ǀX�h���ɭ�m;�Q�y��P;p���]�@��_=>(@Ep���0�c4hZ����~�����A�>d�qN�F��
B�e���[3� �<����y=��#�K�3 )�ܘ� ��=m3 .�-n��Gb����u�lg�Ϳc�[\a)�]~*�@�r��rsR��
mk�o�9q+�iUd=vp��Rp�/��%�z5p3�EA���k��g:��M7/� �2�_sS�1��R�h�-�YG똳>�1�����? ���m���tx�`�u� �Zbhǟ�)	�O�?�)jzp�KF�:]�܍9�,r���6�5��µ�4���N��^��,�{�Wk612Ak@�L���Mx֘���ݞ>7i4$�뗾��%>]���ǁ�C���UZF$ep	y=�0]�/x�K�o19�n��\�+7#�4��@�Ӵ�*
^zZ'��}"���1��}�a�mD0e}�?��wđ0r����8>��l��Y'ec�b����������l���?�
B�:�N��8f��P�"D��ג�:G�o9�{�N8���c�l�t\��G���$vJԴ98s����aB�N �f"ގi��R~Y�SrX |�����G�e낃����5v l)����$5[cY�~y`{�̄�� ��y ����Ói�\f�k���u\�l���m5����o�}B7�w����<�������>�A�ZS�ܣ�I�Y`��(� ��������Eݘ	!{��O�p���._`ޮ�<������?k� ���a�ZٵIIEd�/I�'+6�jy�dⒹW6/<%E�ۼ�L���J	d�jBBV�[2�Q18�j�Vh;%���~��޺���Tu�\�ٙG��,������U���q��;|�5BUD�,��x��q�ˋa�% �O@�)��e�Ql���r�A�<��������%�a�g$^-�;�TAg���%�&5���`ad�s��NZ�Sgj�#hV��K"������AƇ�{��ryŒ`�:F�ç.����́�;Z�Ɵ������[RR�d��&V�L�����|��q�wb��ޝ��E��#-����$��fJ՘3�O�`��x�99��eۏi��8`̡[P�: �&�ʨ������-s�G�M|�%.��Kȼ�ƪaK��0!ni��`VI[�U�t�W D/u�}G��)��b���&�č[\#o�c�7��4LkZ�D�>�mD?��N�/�b<\����H�]���Ԇ7�<6բZ�,YB�o_��D�    ���f��?؄0<�aa:�wRF6W�a�Ӡio]ˑ�g>�����y�PU�Hka "v�z��Y.���y=69����JR���6��! J�T.C�-��x�1z�[�eҕ������ދ���O5��Ά�� �'��U��D�]�d������_���M��^P���Z*�U���c�@�#�d�­23�l;���/���E�kA����F���:�E&���@��qʌ�@O�D��%�^���mq��w�AIƷ�50u�� �]1�Z\P4��\���×��g�2��������N!��^���
�	�k�7�%&��}�-�D��I4��]�w�6�1���f�S��p���#m���á��Nľl0�]��c�Dc�R0\8"��FMn��8�Q�"(��7���M�b�_�a+����*�*W�C�#�N�~U�~�,4̦E	��׎��挘�O ��+��c�]l.���ۃ|��S�D�J*�c��,�-��'�dĆ��m�͍�h;潿~��L��0�������d;�`�'�J0W�]��j�k�mk�v-Zf�W�ܬDF��=l��"z�$\0||=xpos��� ��M�.�F�u����X�_3�Gh�K�l޶^��[{�Y.�PP���&&��K��%=]��V!��4q!�m0G�~��7Luȣ�ޕ�ј+.� �-��Ub� �s"cH�.Ӊq��ǆ7��MeU��
U�(Z�>:`E9�����p��m]=�߇o&��b.���r/�h��^�2�7]����?d�o����QK�c��éٝ���jn<�ك��Y���b]I��6~�8���j���k��)��&�t��{e ����ޙ.����ɼ��Q{F��÷����Os�R���\.�^T��j�	p�4n����'���Ȅ�����wK�hI&>x���(��<�?��Ł����}x؞��0�zN?�w���ز�n�A�@���Cv���0I�.����d%�:&�t
Բ}K?}�Ww]�&�6�B���W���k� +��}�4��{|��-8�9�x�����-¯q�fu|=,��>8��������:D����c5冃Zi<i<>l��2�5c��W�Kvكf�aA����g2��6�~����)4�Ig���l���I;�
�h +�v��"����h@ɴͺ�!9���f�2z�����Pm��83��\Q��l�%��ؾw�L*:�tI6ݧmt�$@�Y9\�n�vG�ޗ�����Э>;��r�l�,���h6Fr���B�d��R)A��� ��'�l�~�sF�u���9 j2�SM�����j�<���0Cێ����\�k�!�Y�I��>�S@l�2>,l{��8B��,aNOۈ���֣��ͺ�b��!��v�"˳���ѭ�@c0�^ � �_3���P��-.���{�����arHv
 zf�gJ-}�2}�m։NI�)�&I�R��5߁�@���%��y�;�� �f����������%�T�I0G��K?6������Q� ���v�q�bskBAI��	�R<)�s�bR}�]�>��>��`�tD�S���(���"��;�jS���eD)b8���,=��0������d�M���گn��93{cY��89$YWJ@hQ�y��W�0��?88) �����C ���Z����Dq��|���v��E?"�O�<�l��M��U�7�l>x�"�#<b����?g��wa[%��Aꌠ�0	���N��=Fk�8?:m�[��M��][=2���s�s�`^UF"^Ŀ 58� d/1+��OC�G�Y�Eg���-�� j�����(`���I�,	�mL�I5q�� ��;�[6���ZK,pT��Y4D�ky�e�����I��Ǩw+x��lWt'? )�G)k����l����?n�(=������f�l�c9�F0U4»X�SeO'O���q�C>n�G4�oN��ӫ�e��h��Yx�hj���^b_J6zx�>g=x���[�ŵ+��
ܛ�8��U��,kmB�k��г=zs)�2 �@`�;�SBV �ЕC��^��媴m`a���vfc�am�s�a5�]H.��C��;@G7��c
.8���� O�V~l��YX���1˖v<��'��՘��"lJ��`)x'q�hAP����?������0��qAc_��+�5Y,ʼ�� (���|p�.�_�&D��UQ���U�i%��Ie�����JY�,@�+��ڞ���we�,�]tE"ȉe�N#�18��H�T�N�+t��� ����n%z�Qwc,���CGh/����k�l�r4�S>F��A�ga'p���^�w���vI�D	�{.���r��׃���E=�:��L:��}�%��8Hf;��{(�O���Ѣ9h\#Uh~�U!�[�f�ڮ�㊻6y�3����s��Gn �6���g�OB���;���m�~�h �G�t~�"aɳ��]�m�9�C��
�j�3w�
43	gVa����+3���\��X��=�9g�) �5��<c�	���[l-��2;KV޸��`�l�
�&ڞU��%ۦ[j��-ƕkU4;Ɇ�9"�\T8y1�-��R]�`�h;��Cc[q���\L~�?���=mg�#}�U7l�c��R�rw�Š��=(�"Bx��^���mf�s�K�vx���{f�Y��7?��`���6%|���i�r�(?��[�!ۓ�[B�J����"Y+��3Sg�E��/߳4�B�xӰ�������M�=��X��U䌅4c����m��-:�\m��R�߅a�NBR�dt�i*�h���x�)R��`n<�r[眂_��mz@>�CoY4ߜ�������R�j\�b ����@�䗢������c�oG4i �V9?ǆE���nL�a�F�|�1�Q7v���	p�v1%��ad�{ȶ�9��f���G�كL���a��yG�w�`;2�qs`�p�����ے��Kl�{%��}M��L5�%�4��S��°��{��u�������_�ͮ䟲M�e':Ӌ)�35J��O��(v������K|m?8�i1����k��ݏ)��U��$c&c�^ի�!��:� e�KՆi�@уhB�wN�9�m��9L!��9Nf[�����$«:�������� 'w�j��K8c�"�_8���C�p�'k���	��§R��'���HLlp'�ϖ jX3�����T���]C�ߣd߯\6���@�EG+T�d�*KXŲ�)|�t%��=0yx��#��~M��{��f��:���.�[8��S�t�{�5}�K�Od�&;Ns�Y7������kR8ړ��{.����[}S���V���&zcE���3ҡS� ��]��F0\�m�?�=��� Ej�1���3X�4��bE������\��v9r����%!����H��@�����Tu���>�h;P������=�Dp���-3a+BՀ���� 
�OS4���R:����6a5M��� �+���,�A%dp�i�v�:8�����8c�alG1u��f���R�`W���L`��k
���)'���5f���6۫8�j�#J"/ȑG�r��N=PE�����8�Q	N�8��%�2{B��D4�!�^q�'+� ���E��_�d�#��w{�z䉟1�����_���
�m�6�=\��4j���d@@�����)"F*@�Z�R`ЂK��wn�+Q����� b����A��a�;�_��Ʌ��.����n�VZ��(<��h%2��d{ͭEfc�/�z�%_zrE����,o\i�r���g&Ux�-�s�z�����F��F�m	�����뜍<g�۸�<�4+~4����b��T�~�H�f�� ���@v��}֦�ʴ�r#��ng�`�L&���5���~):M���#�����%$�Z��扠��=��
j�b�}`�E_Ä����1{9��$��M�]�`����I�`����m�Pc�Z�S��|_#��4�F; �    6NP\��v��m��-b&�z
�;��V����s��D�dc��S�=���\N2g�3��?	�k�����Քb/��%���$�>E��0�>-Ec#�z�yQ��Mom��&�4�.\?<
�f|���������u����Y1y^QKG�M#�q<�\Hu �* �3�R�������I��*����`����i��>�G��ֻ7�i�x�?�n��b��u��a�
��O^^la��%���f��ς3u�ݛ��kpTEլ��Hr��I�^����Zߺ��SI��B�P��ăVS���%u.V��&P]����pԬ�c/�Q]�g�^��We�N�ώ��W,����У<�v[&��=5�|IR#ѥ��t�)�p-q��=�[�b�����h��㊗��B]3A>���Nw.i6>u����C������p%F����.��ZJā��M�o������Ds�K$:�C1w�uv��h1���4�2~�{����F�e�[��0���
 ��ԱS�ͱg
�\��@r)��0S�¤ik�����{D� ��n<2\J�Ou�-��aX�49x�Ҋ��zEs\u|.-ILZ�Z�[`q�p���:G��4�+�g>u��-��a�x*)0aɘiD�=Տ?Dᆖ�p3)[Z�P�iq�'��7��s�l�Ys�+j�o ~��N!6ȑ�Du�LM�8��f������fm�!��
o2<�piO���͚h�Q�5 �	G\�X�-�V2d�qRx.�����?	��/>�3����*M����|J�� Hbs����F?�e���*>��[7z���8��q�sJˮ�>�[� ��sI}��t��B��
�DJUC�a���4�?�cpX�@A�T����$��z�e�
�a�Ԉ֧\�a!�J�����9�-�M��ɔ������1��`�ý�RȮ��9)k ��8���`ގ�/��ۜ�f�ЭT�jn��Z�����7�g	�=A�p�A�x�F��/�5ג�-#R���rh�����v]�]ꋑ��]�7��_��|��0�E��;;�U�����Z��F��3ɬ�Q-W9�֊1M!�0�Jf��'o�e�:?�8vbin�
��|Z %�^�G���2h�{�/�B���a�降
��< BF�𜳦�u����W�͵h�g�}|��:u���� tq�t0��ؔf�W1A>���t�����y�!�d�bA�W������BuB�D=�Ip�p�{䴯Ҷ� �ř:��Z%)�v�aPe��+QHl�bO M�~���}�iSڳ�԰�$t�`?�o}5�S�wpThU(��Rȣ�e���VgL{��t/`��	�6:�uh�Ú�O�`��.$F�޹��K���Q�m!�	�P4����T��ڙ�Z�M�����[f����>�=߫Y�Rvꗟd�`��b��c� �Îe;��F<��������a��3�+�*�-Գ7d�����a\L$,&��:�逸��Y]fK�*��&*���Oӗm���&.=8�6(��{��d�>\,�r�ز3�����k�ܯg���9!��/�!���7�(='��4d"uPѝ�t�zM�L���mƟ=+����D�t"Ew{{'e���Hx��6Y��D�	W����t���d����qb�T�	�Y�TX ��#�ѵ�x>/�?GV.ˆ���yK3��^9[I�[�\
��gks��Z���4^�ծ�t�#|�b� �h�4�����(iX\��uָ��7�ӭ�$Xo��/��&2)�S�U�>��[�˩$��ܟW��ŧ5ǜ��2�%⋺k������}\�=k��O�9O�</�_3��K:�ͅ؁gK���ܧp�f�8�0j�e}l6��$``I¨���wH(�Hi3�F��`	�������i< W������E�ղq �c���r�wI����+��,�+Uh.�x.|�S��T��]��.��9�����蠻 ��T���v����`�''��t��R� E?���{u3�k�n�R��`���ȳ�~5usӨd1�o���d @���B�^QG7��m}��Ӹ��iT��5��(�_ IlױMG�`iA.y�h4���|�5�Ů�5p-���i��.�8Tّf�gq�J{�����9���p7
�>c�|첤% 0�>9P�:\�k�6$��AÚ
;���Ղgn���vk��p+8|�-[���R�'at�Ky�]��X�C6b	er��(�{���,�U�4K�T>�6�d��Po*,Q�ӗ�l
[:@lP����tM�W���yC(,�K=Q�� �˲��Xj��;ve�B����p�)��� ���)ꂋ	��X;[��^�K
�]Y��z�3zp'&�3�������yԃ���OU�~y6 &,�U��]}�>uλ��4�v4�1������0��[���(�_�>����a\��0�1i<�cf��&޵< ñm�����?��+�2(��eF�} ��W���O�<���)�3��z�F"�ck�Zw�2�L�7q�$�6�&�����{	�����-rz�{~���{X�k��!�/ۜ�>E.��n��ǿ�t�<��ւ�~��@�J�-K~�ls���	!�>��M�޹���TJ-Q3aZ��`��X�pt�)�����X��[s�n�u!|W2^?�W��Ī�/�����e�1��4(Ön�1knA�\��Z����U!q�8���d��c�|,��]�A<咳�)M�l��r��3,�6��<B�oC ������̙�5oj��{o���N-���foN��{	�8���w�7��#n�Y�\Kb6L5&4����He���eU;Ӝ^*M+�羯~n�����*�v� �g�\g����ZZ���������ʃ��U�����{f���e�`�@Ł�[��,T�m������� hp�]��ڝi�3jY�.�k袆M{���ZkT~ɬ�)8p�h&��&J�&̬q�5S'��b�n
M�
��ﾆ���4�-NRp�t�ːzr+ƕj-�jN����4�Z?ݟ�[�^� ����̔+�nOQs��=kFRѼ^��s���Y�(�ޅ�����8�݆N�����iK��Ï�3��}����ZK����4���h`G ���ZKA}D8]`�Ѥ�����ݟ���R;p�]�YkЊWέ�t_�^s������_�We�R;�"�*�!�m�>�*��5�꫆���p�}���<h�����
�]�͊�[�Fcm�r�6���a�U�g�j#���-e����{�"ID��{���al��"\;��(�o&Xi5�A�n��ެ-�»�Mx�Εu�^{AVkKkx#�i�wA,�c��϶nag���UE���R+],���Gk�A\(:\ݬ�����]��3�0o��ƕ�8����k�#�P�8*�נi��i;�m}�|����ҒZ����R�ݻ�t�7��(~KKN�#�|��tkK�Ђ�8�M��T�d��S��R����[5lL�T��Ii�pn��7�C�9A����ۍ�%W\�9��"�N����BA�,�U�٩9�D�'|��$�>��5Z}k4�Y��^tI�%�Of7/�Ƽ�`-Ӹ�_)�g�@�:"�/|)0ͱ[��8��7�y�w�����?A�k�?E�
nq���W�$�ح}&�w#�����h�E�r�Pes����8x�22���$I���C!��1|�e7x�����{�\��j���e�]�?���=Y,��E��[AgF���vih9���p�����I�gͫ@�o�꠻ �m�l9�vF�P?�j�:�Dd�$��㰝�x<}j\xܕ��֒��� f.`�ʹ�����Ğ�)빍=&D�J�>ˆ5��w�6��+h-�|�W�\Y� �e,aֹl�}�j�W�A�c�y��X��M��	�J���F E�3m��U��jd�����{�u�E(�<�Ƙ���6�$�BD�u؀l����1��Wp�"ۡ�x�\��n"l�6=����7w��3o��r���l����ˑ���-����*�r��j    K�7 \l�-�7�R
]KI���wSOv\'���p��D.�p��'ӝ�m�~߆k�5�l4�6�3�m�8�C�2�q�w�2�U|J���c���6JN��}�q��3��8
]G���|S��mH����k~J|+t�O���(ٳ����Ҙ�����J��8Sb�ac���~���v&�2N��%��D��fP��}�T��֘�f�B��Rl:���L<���c�J7~0@)�Qԑ)M�׭�"��!-�������nim.�-c�uWK��ZٴV+���a���XV��.禴�0<���Ad�v}�{?�A��Oa=�s,�t*�o�>Z�ro��9w-�G���M6ٛq���D�e��t�@�i� �67p�eoM8�~�t�=t)tp�r�r�w��%c)���J4���\G������{��[=������q���jl�ōks^��dq�@�"��t�F�h��{�����;��]hf�ЮQ�R��}{�o^"�{n�u�涅�EY�S_҅�b���M\8 69�����(;��
abw��r��?��!���%�lp���*�& ��i���_�����ި��@ʁ�I��w�Z�8��f�s�:/���;YYKu�th��ö幖e?x�ÿQd�s��zn@�Dq>�nB��0�r<��<����8�xL�O����J��sU*�|w3 D�S0">8ı6��p�f��������h�{i>�`��Ļ������D�y����!���&<�N�k��O�u�'K��ŌiB�V[On�獟_�rA�4�aZ,�3Hk��E.����-����m�w�<�]��*�^�P܋*��V�]�?(��7_<S�=��
�q���&����,X�����sh���٘��%�&ˡ�1�Hۈ(��֢�v�P�1�w4I�ϕ�-�weT�{D���L����^鴝�S�ɭb��Q��ő��ߦ搴���`j����q h�cV�>���j5v�����[��R:�8Br�K/���$;sW��y=���#d4�'�����6^�b���N@�p�J��kK@�7������a{�zk�y�b�J�Lf����ĉ�~\l�p�}�Y�`��*%7;���.��Z�����/=k��:_��8N�/#kԃ*��a[H�s�>�:��;�u�L���{r����5�}�s\OA��}�6&�����j�W#�j�����^X}��~Q��d�Fw�
z�.YVp�e���9��k�ؠ��� ����䔟|(�l�m�v �����#��X��icG���fP��xT9ֺ�gwB� ��p�gF[�!7�l�~��\@�u��p'�+��1����� �gWoO���,T������<���ŧz��?N��#�U#\���x[씣)|T��Jd
�ld@��X�y9�Z����[����n��R��SL\.NvT�k�8k�Ԥ6i;;{\DH�����R��-�K�"�]�҉T����6�0�`mS�����͆���.�~��8:1�o���ԛ\
�@�v$�l'nE���M�rz��J��]Ւ�3��ƙ�;��b�D.S�;���\ϴO`��P�:�[̎�s{��>L��O�@H#>E7.�B�Ǜp��2�ʸc 6ޅ��ƕ}p쀣 )WH9�A�����v�ٞS�K� �w��"����.B����c���x���Gl��l��~����ZQn�VV��(%^`���`���#��^< Ͱ����/�\�zs��qv����f�˦Y��<��^�N�]"�\V ;-��= J���m�� h֧�u����uق/0�Z�2ն ΃�s���kI��P0�sWD(J]������sϠk9�6�lN�.=����U�a|�n��T��ea:��S^m�ֲ(�4͍0�9�g�A^����b�S'(8x Ǚp�*�l�Y�a��$\0����~T�W2�����wބ��k@�d�r�����r���
d�����t�q1�@�v�(�i@
ē
P����˂�5��5Ѵ�pG�'t������&�.��Xe���n��a�X�=��Hq�F��z�{�-u��X \�������6�Oi ��6q��~.ww�z��& �ٕQ/�����ڔXh���>O)��ajWK�\�|
�Y��cD�n}�,���rg7YW�'G���v1�MѸr��->����ց:�Ql�,䖨�C9&�w���'@]T�u��Ӷ�g76/7ؖf�Ȯ�T�C#t���Jq9�:��yEn�?p�{˖�o��oe�t|^o��	�q�8�a}�&�&�0ͪ�i�?r�ta�lL���r�SS�p9��b��fc]���|��;շ��r��}�[E]����:+S��L�����i���s'�����%3��"|Ҽ?6��^#&&5�}K	�K�YHK�q��=��V�K��TY�qwj67�{_����/�3����[�Al��s�;���Rg.Q�Mؿ�1�2� K )S͘����o�q�W����q�F���AONZ��f
�'�{���m���&���X|K0�$Ntj.��_�WD ���U���W\u*��~�R����Ed��=�%���ĝ�쳲,K}В� j��	~���2�;��\�-+npk3�w�s��N믑;���i'�������1Y<�_q	����4�:�خ�5-\��m�N���T�0}�LF����B&�Q����n��a�e=�j��C��l�q��������zo�8�Z��F�)gw.N0ȯ��g��j��x��3-+|ro`p��j��R�Q���w8���������ma����e.5�;r#�.@�i,�+Ny�l�����p��S�Ǎ���Y��-!�:m'S�0��c��E,�R�-�>�=m;��S�a���>0~z'q�C%�<�q׌l�������Cնe���qd�V��E(rLs_���;\d*�,y�ruJ7.�T�m=�z���7Fw.n�*ç�LZK}��ci�K5@r��$'Z�k�U�B�;��L,F��ݢ��9�3�Q*�Z\���tN�3o��� �ZDg���n�_e�J�R�1�e܅sQܧ ��o��=Uz���w�A�-��S�����[>���F��Xr���
.��&��v��)씔*�?:���XC�_��[�:�ؾG�l�ݭ4�[�/�%��j�d�
�6'ms����R�B�D޲{ToW8���T��$S �p���f~y�=oA���������N`��*
�"��\&��n8�>l�
��X���f����Jv�����*z�z��L�s�"D���DY�]������ PK���&0"/�c�Lh��]m# �}�Vɀ1H[��{���F$3�LD�&Z Њ���Ѷ������o�طZ��[nྩ��&�`S0��Šb���Ɨ�s�~.{\���|S����i����U�@��H�^�3��ʼ�:��j��ڶݚXtl	^���)ܧ>�����J��@�7�G.����`ϳwou�4��q��� ����&טO-�mWs�Pс@N�V�o�e��k�p��r���fz���S��4Đ^הh���|I���s 7Q�J	�V�k,Qңd��@K&�Sr���YH���a��s��Tw�)� �p��w �<��u�xp��v���&�]���xo���+"��� Wp�ᮒp�AFK�SFT�;����k;�5��`�p�l��)�"������F5c��L`O���n��a������m(��Γ\������;���?���Aۛ�L�A�Vjɴ���u-���F@��t�fW�)��y*s܀���A,ܧ��B#�97[]X�U?B��q�/BI\Ӹ$=�@��� ���lv�����+�{wgQY��w�~Du�T�5Q�^c��gs8k�BI��7��Y=ڜ�H�m�?�)V�T��z�R�����)RS�6d�]����ws����q�)�b�flk��L=4�s���,GrV�QM�2�9})~?������-�q!�Ϻ.9���B��v%ǹ� �����(�2�o��@E�;�e �;��K�*
�
�-�    a ����e����)��S8�A2p�O/�QS�7P)0�BIӜ�dl�&���.�Ū�����g�-P؟�*ml����&w�	�.e�p>�j�$��,�{w���>3�U�[�Tq�{r� �r�R��W*"�g[s��v��b,Rq�d�;U��T��2��k:�k�k+������-�\h�S�Ȯ�b��MK�3w'����e�>�6�4-����U��}jRq��I�_:���t��΂ ���u�9�l��mS8�N��B�=b����qD�@��ߓ6
�����5iۚ�fۦt	�f.Z�n�H9��ba���G��y�����`���=A2�ӯ-��u�����^�y
�,�=�[�����b��5��zi]oè�~�b�f+��E�X�P�3���>��դ���K�c�gu�E��7-;٣�Fx�	���������ŀ�MJS�&NQ/Ef�.ʠ�(��ve��8�*��m-@`e�9i�:t�l�^#�.�>u��F��SG�h�ԔT
E��e��Z���m&���~���+ö������XP~����>;Z.�VWa%�q�9��|x��6{��7;��ʄs��R��֑�;�I I��Z������Hu�LVv�M���������8m�o]�ժ�qm���í�WJz����d��(P�Ozob5ٰg�r�� �0�
�6��s<x���ӹOBF�^N���T��`W�,�i��OWn����oӴ��Cd����R�u�_��m����1=�vCMqP�Z�F� ����+���b��&xwg
�R�16��'����b^�s8��{��C�>�{����{��(K�?�j�Q:M8�8j�f�b�8��=ԮVEȴ���g���zI���9�I�Z ׌�p��	�N��:.�'�bP��́�w����v��$�'�2��_k��oK�o5�5P�A�����D�J�`#do������S�z� �ۯ>R.+���w�����B\$Q����2��
|�x�6�`�R�us��SY�9��^UJ��ïD�$�q+=�H3ɨ�_�m@��������k_��ME��h�x��� QCg66�Q��)m�|���GG$e����HH1��9år������Ԉ��QO�Vq�s�}�Ef�'�I�%���k`��w�x�KSg�sP��=?�%���X���{�����=�#[�q� 뺏��S�K�y��:(��:S[�06~��xê� �;%.��h�V�e;�v���J�2�[&RW�&�m+�t������+ysq���=��|��F.<6���#D��r�>s����e���l��G-0����ӆ�O)�%��@�[`^�e��S�����s�%�@xG�ѧc���R��������!>uD��Ty�)�GBT5,O�1h;S��{=�ո���$�;��$����jϳN�lr��:�c�fi{	��2�E���9o��笀��Ҵ�I����ܒ�)N���V����6��4�cS��cG�(7ђ���2A���F/cJ��{S6�t��?��l  ������Q��N16�F/�+���p�v]<�q�裇�r���A�^�+eU�c��_��t�
�mi�;�?m?�eb=����l���%�S�+�� �.5�W2/�N���v���%57��ː&e���L���Sń���M����IO:HA2�x����Y�#u�%q�����3�1\ɾY'�@��c�E�e�L�R迫�k�.�u��˸ 	�ZW��۬e�.�c���ı�+��7Q����\5l>��gş��&ޮ��5�%�C��a�3��ặy��\$�$�)���&�]��ݭe��\.��v�L�q+<�T��0\r�jD/����.��L��V=�x�G"X�#=��9�f�*B�����WNZ�7ؔPh_�ܵ<�C�D�pg��[Q�����L���T�*�,ګ����^:H�񦠧TS��g���r=���ϬI��ʍ3���}*�v�\�׳LwS�c�o���3ip��~�k�Ց9��� "�����(��S"��%kT.u�1�eR��4\;/<h�O�l�L@9�X".�˼�]�H��v�T��(9�۔3e�;w62um���	������sF�k�0U	`�F*lg@��_�6�旴l����^Yf 8�wE�⊈� �L�sp����6v=�I�B-�߮���$��C�ӂ��g��jZJ�	к�Ç��z`����sey�L����i�8��֞
@Q��\%�p^밴��A�����V6.����-n��ؔ&�l�5�4�$���ѵ*�������w. ��L�4�Æ�=�!����c'|��l�s�"��9n�pn�����wJ3�j:יp�����I�r��r�{%՝O%1q,��eIq�u�ܤ�!I�*]K�i�2��m5�7��G�ܘ�Waҧ2W�m"�2�m���\o]���O���
xX굸b����R㍣���ګ�-_@K	���5�^��_{�=����yA.�^^���x�E���Lr�h&�)g �����|���{wK����>8p��=^5��8$�Z�HQ^ Ǆ�1�� ��s�1�c�������4��oϳ� �>��4�sW��iz��[b.�] ��Hn޳���s�肿����
X
�9N�?�ӌ�E��������F��ZV�w�̦v.߶�T|�%�P����� L�{�]S�Q�-�]G���4��p�	��DK�qVYƃ=n��L2�q$7߉1�rkk�Գ�2�4��*(`�#@/kϗy<s-��������`R�5�zr� ��sjMѺ�#�y\��X���M-t���uӴ��L�m�n�a^C�CR�����r���-�@I;�a��Յ:�Fy� [����ж|����Հn���Eh��j�p����Z+]�j�
a�担XO!�/n�nu�B��ܳFT��w\�RqHi�N�1�c������'��1���"�q	���pnL�?�^�H�Zb��q�yD�3��W�qv��<XPam.QA�r�eDv1@��Sr���bAmK0`��fI���s1��)���&0�ҋ���^���ν��_Z`I����-=N.��~�jJ#����d�"�[�����Vɂ�L ׶g���~�\�)��+�p\���I/�,��E&�b���{��^rw��"�c�Z���
�r+�[~@c���s��I��/�ꩇtO#s�A\��4q@��^J��*~�:E9��=� ������Q�/�[5�D��0���U�p���Z�w*}���Ƃ	�d����;�����S����������O������.z�˂3j.�%�\��!(u!���g%�/	�����-�֮�f@�ԝ�@2�c��8���0�m��e�`5<l��	w�f��Wn4d&�����W���D��ml�4�����[(/��^*9Zt��� �2�c 2������K2�N����-��R%�;@���+hh�T �yˡ������Q����_d��w�)��c��J,�w&¡��)�\ҋ7�z�D���hɲ��{��-�������VQ*dEzK��XX&�XL�[������{I�µ�@F��.�12�vʘ��=_AO�N'�R/ Tp�����vMq��f����G�q�_�[m�;�.�����Di<�9ݐ�u%���=�)��~���OVCY���d�m~ѽ7�K4��sa�n��[��x�ɕ�=X��"%O�zWh�}�2��M���?�DB\�y�ʙk[�l�^ B�aO5�������s�`w����� ��Uk&5��\K�d"p*����˲��^#�� �nQ�qF�a8v?���(�vWJ�Mi۱��롞[�d-*b�֜3ֶZ��f��b*<zr�A��p���{?Ǒ=S���6�;�ề�H�&�`ƍ�|6�-�h��j���
�FD	�Kv���ns_jM��$�W���3u�a�~�����&��pt�5�[5�r7�O��PӠ80��l�:Z�)��П���-��|�����    ����in����I*����(���M�{K�4���{ϣ<�
�X�x#:؞�V�s�Iہ��?���ݰ�O|�[�B�D��j�=f�p���1p���Y�5*y���>��9{��o�\J^O.�Y�smrp.]\�%	��2M>|R����ml�{J3���Qp����5���PC��Q_\Ջ�s<��ܒ$,�^��G�	��<p"�#�.nF�q�~:q��a/�"���Ů�֘VK�L�*.(^+��8�+m�/���?��gC��ݮh&7�X[S)��-I5V��n�	hW��Ϳ	��Sֻ����@<-ׇ
(Ec^�1��	7i[��z�u��ַ�w����fs��qGeGnZ�lW|j���"m�9��&���N�&����n���}���r���� !Rtq���O�<�Zb ��G��(��]YX1��Er�ޏ�ls��/��v73q돆;є�J�S�Ĝ�L@�C.����e;��Hr��1Q��t�7<�$���5Rf���̅vջӕ^A�in����������� YL9�v�,��$aS�=q��d����yT�!z�U�_�*	�"H��Cg7'E�++��q0]ay�]܌����xUS�����s.8r��,�=��X�9����P�s#a�t���pŐoa��%�t��q��ձHp-Y9v(C_�oJ~jq�9��=��1Qlj�LR��"%��T3>Ȍ��IN�T�}�B��*����9˩�l8��L��ē^qx�s�Nk�����O��o)>�Z=�/��1Y�_��]�F&�,�\�Hi�*�?�ϽA�=�=�T�(��ƥT��<�H�p�3�t┗R�ǣ�wp��W��'='-�PI��³^�U����W��՗j�c|�|���;'tpw���G�/J�;�ߓ�(�%�� �^��s��y�=|��;�9�%0�z��¿N3O�Ί��w�qo���!�>��Ǐ���{2ה�n�x.J$Un�!R���T{������ʆ�������e���7��;�
̳�L��Q&<�����K�tP���!TlY6�2�&�Jp��JM�R��{{�/������Y�.��}�k������ևpo.���E�x�O�c߷S��oT�xʓ���1pɒ5�&��>����T�W��j�d���9(:pE�E�~L��9p�?��n��|k��C��ȸ����'\L�L|�ǟ��w�|��cQd�	�d�Ug��}ڮ�����v6��#�����W�z������4.����+!hn�����!�i�2�Oџ>Sq��/l�"nq������aBi�[T�cLnB�b4H���r�~&�,���,�|\&���ˎ)@�6`��4L}��9Éq�3%�����č����;�&�Ӿ��]o�h��=��u�t��]�I<����NH��Y�/)�$�.ah�`F�#Z��:$9��j�?n.X0�
1�'I͋���H�@ZlΡ<�x6��0ͧ�_����2�ߚ$�P��Q����E�5#bO�4&�k�S#=�����<��{�����7�ϩ�Wdҧm*�����8�-�N�r$���;J��Z����P ؓ_~Ǖ�F�T�$C��$�bh��,�n�29��I���x��K����H/��*.k��r�p%�/��:�x���pr��D=l�*w��2r�>���l�m���Pr����}wĥXq�'fn2#�x�U9��ʋ�L���#��F_
_ZQϟ���l�V<�����q���/������߱���U[�45G�x3���=�x/zv.8�ո��`K�xn��H���c[z�D2�=���9�Һ�;�;�w\���������x�)����v�0�n"�3B,��{s�^Ԥ��� c�S$�i���>��#��#p��U9�)-�P�3W)�����6�~������#�b3�O�9f�L��B;�_.��y7N���m����~+��RB)�r����_y��P㈵���8ߨ��{Q�����#��KU���)�)���UM����"$���d������Ӕ���}�ę"1.W���J�5��E;��<o�����8)?u*\���S��sL��k�\q+5���t%��������nQ@$�s�g�߇a�������T�N��4�PΣ1�=���k��9S���&����H�P{�.�Z�BM������-~0��R{y���~_�6�P��!��I��}�����uDM^�Q��NErLӅ	�/�:��6.��w�v��:��N�QHIU��%������4�&����w��X:�5�!�M�LT���]�^T�#;%�%�5�I?��d�R���G�)#�(�&��1�TlՒ�fF�/��.�G�`k k<+�����Ċ���w��c���M�'1�À��F�u
�UR�ir��Ȥ�>�u�k�3���׈%QdÅ[$ߧ�獣����Wk+'n�nR(�qo�kG�}��G�0���q��~��5����zB�j�N�,6[ķH��ԑ8a���(�y6��Z�5��0߼W��}F��6.y�� ����vR�"�į�v���c�tV0q��)F�وEq_�E�$fhC�4��3��C�4T��?��7׶�G�
1\jJE��	��ŉ" _�M��0l����_�����*�����Q0C�kMΨ�a=������e��[���|)����]��.
�.���凌�I�d
!Ox���.T��SVqm?�N(RBK��^T&%[)azRF��252�c�=���pQ��������5���wɝ���:%l|���Qqjj�Ǭ�t��W���Y�G�l<!YɫNI$mY��י�������A|o���Q�8Vܬ&�v_�@��<�+u_\s�S�7GF�F�"�wt'Mp���	#/��%��4\;��	Sj>9�iD��8~W�4������kӭ"d&e^�8!��ܑ� y�Ss'���arQ����ҳ1��g��x)� ^�HԊJ���E���Kq}/�	���rz�(kt�qI"4�py��?�(����&�ҷٿ��h��^������2b8T� D�_p�;�v)��9������ɨ�Q5��Z ����v�J��M�:۸��z��_�̠��Ζ�Ugd	U�Iv�QNБ���r��=/<����ŧ��>�[�;x�~�iz�����v灚��VHHI��)2��s��(�@��C���$s{>�6��P��0��
�B�M�Q�%�&I�hڸ��d�S�(D�g�(	@RΒ�PHB���S_�oBq�W W�ץ��q!
�Q�v�U5l_���ƹ���z������P����e����9��F����oݍ���\|$ddT�G���Lg'�3��y���Y�J���x���I�̈Vǁ�俅;�_{1�8b{���֫�$�dc��		w7��������i5���߷,�q�E	g��ؽ�ߨ��3����n�<�n��S�{�_'e6���d@|���p���p��bkȌ�����J�ʅ �.%>n�ǏJ������@�we�a�4�3�������1���3�۾te'A�Ң�0;y*�'��-6	'bG�W@��k�=����C29
�uf�Z� ʙ���[iO�q�H���ޡ7$�m�GIے�7��\8��l!Hj8�k�#hxѤG0�Y��u")�œ��L����_Z�&1��Ƶ����&�0E'.����X$��a�&f�H��Y��Y���/x"B�U#Y���e�Gp��5JΠ�E.�
Q)��m��/7D@nVq�^��nv/�j������myҶ�Dl���+15J�%TF��F�զ,c'_����s]3.��vB�~��c~fM��p�g���h.���I1m��p��k@Afϝ
�q��l�9i���M��٥k%��<�P�gL����F�����=���:㹠p3��VI�>w���yx5\q$i� �ʞ��%�Ǒ�c��Iw6m$�؍���3�ʵ��h�-.'��"[>*]��L�7��U����^L&�΋Zm9�]�2�O���Y����h���)��C�s-P    �r�MG
7�vXE��IەH���w11������	�P�~Uc˛\����A�e�"!Ч��1�;��s�5�-�����qK�djpk;��N��ŵ�5|�J��ܚq�0k���}f�B�6[W�H���g�`\�؅��O���;f��?�����E�<j;�ܶ���BIR[G=�Q�w_W~�)���O�%q�䉤��h�m돯�o�ek]+{������%�Ō�U�䃚o}!u@Y�2Qw��U>6j���K���P���A���
�ݛF�%�k3i�(W!��.mΎ�V4�����D�oK>(��O��e�ݓl�,��
�[3;��LZ�+�\���m?��R���s��iF�����qܸ�>%�Ei�`:��(c�ԛ��x���� S�V9���G��k�.i=�P3�%<vj���C?�.ý�5���9�cvT	��Go}87X��R��>Zb��(ұ-*��]�T����<��9���Dۂ���>�s�%�S��d�a"��7NB�/u��l܁5k��g�9�M�Zܭ��z���ݧD�0%'�wT:[�}�v��q���EN�����T�[2y���x�D�lO��z�X�ĿV)vC��~
%'����:�����58�(B���!��:d������l���D_��5f_�Td��_#�N�C��"��8r5�9��ж�T��I�-җp��C<�ۄw#��R��ʡd�gO�o��?a��n�g"�P5k���m�W��o�C!�A@Ԧ�� �l�6a.�,Ipa>��o��\,���QL���(�I����^�g�l�(�
��l���._RQ�!F�p0]N�1*2�&��Ӗ޻��ш��`h���[�78�:�-�0c�������bdu���w�dy�(��]L��f2ŭ��q��~V�H�u��C��;z��#9'9b�C��C;{��*�x#�L��\�BPGʂ��l�&c���v�y��
-���He�(�*&�C��ݕ�u?��F�q%?������̌����w�U���̕, �gyNɻ3���Y�Y�Sz�Ln�}���Ka7�e�!U�ñ"{��g{����o� q6Kq�ZI��\�����E��,�M�P�r<~i�Y,9��X�!���Wym�4���kאU�o�7�.�y-�J�,��_�R�L�Er���o��sk�QQ�!�l�%��s�Ȧ���I�z�*A"`��B��0��<�H��+��S �'��ɮ�5�������q)I�c3 $�A_E��n����Jf���#���Mw�������J�-��}3��%�TJ�o�LoZ3N�h�!��aHЅ*�JfF�BN�uicb�Q,���BD��^j����=�'ۭ[s]x@�0n���B����R�w4�gS�~�"��.	�ūT��΅k��k�p;	Ŵ�}�~�-Ԓv>߸������%#C�!�vb�q�|��e��x�j[̿AO���z�qD_&}\��NԊs����w�\:��q؞vr?kQ!���L�=��lӮ�铉SX��E�Bo�����A��a��[���?9`��b��h
��R�.����������;Q��t:��	8Eq���(H�S�m,r��ٌ������'�iK5��	�~��eG,�ȝ�.iu������E�g�P�wĒ�{~���:j�Q�)DjuTF��3���$-@Y,��s!���bjRli�p+�B�:p�d�Jr.x���I}���6�T�eE5�W�&,>�Z֡H�RSŏ������
i8�^!��c�:��%�H��i��f;���1�F�ͷL;��x��ܰtTUF4�x�#yY�H�J�Xց�OR&��#�x9�+Oa��"��捋Rn(�L�]�I��1.�|%_�F�>t�n������J�7�_Ol^<\�q9ı]�Օ4	�*�i;�)^(�B����{ ;�%.��|��!��N�v�P�� ��k�GZAJ/�m��O��k*�p�I)��2Jx!h6�ݶ�X��4 �Ն�M�w��O�8����yw �H��,Od#v�����;�~Up�WNt�O��jc�Pw޸�˫�;i��\��4�5�e���c�����6MWR�S�(ۘI(v©�*x嶜���cT�j_���K��dn�gi�O�ѻ����"���߃s*7��Iۆ���\�=��P��K�w6<��Pu�3�\�=���S�Ap�a:��ٚ~d�$7&1�m]����A\U.�_�;5?I&7JG��Tc����,��.o�;=��>C��^6R��r�"̓iZ�7<}�4=�K��c׻��B��5w���;��1��4M��������o���M��Aa�g���%$u(���F�B&��2��!(�m. �2�g�6����Q7���/��v�KҜ����>TvƑa?5?ޞx{n6+�>U	~g��ĭ
u�W%�q��OS����m$������n<���C��Z,!9���(�!B2�'`�\%BVF�,�R��}�j8X�:�|�Շ����F��8��C2?X��U{4^���^���j�X��ݭ܆bw�ǜ'W�@�P�*Җ����t ����b#/�\qY�,1l+#=��`Bq��S��M]�Y�w����9�a��+�����>#�l��%$u���7�S#~�ZҦX�K�En�2$'��,�B�Ź��ed�W�l�qۗ `�����<c�I�ms,����/y�Q��"ocX>B�K��}���k���ʙΚ�[�r��39H|$7w��e���p���(��c��;9b�%�DH��ݕ�bHp�2mq�̊<zD��z�A۩>_�o�R
�oS)$��`L"�8H׈�߭���x�D���Pگ�)��a�$�H�'<����M��I괄"�y�ڑ����vzh�}?�1���T��'
}u�=ūh�,�$��H�}pv�Y�s��Ǳ��X���P�ӡ�F�p�VZ
���Q���*��˫����Q�uz��D.m��]�^�8��*z�ym�|	�5Ѷ��%��.�3^'6��.������g�n���R�(��TҢ�L���󖛳�:	�E�sT	k~�)r&�2�O�R?!Sm-�v��v͈�������^�P"ʤZ;*��{����}o�k�'�7} ��z���(��)�	�����JB(ȗ������t�w�4jp�Omyd|e��u�s��%�x�k��"�H�Y����B���[�E��2��}P	29���s^�l##U�o����8���b��x����t�!�YK'\��Z��b��~@�j���I���`�bB���'ǭ͐�OI0�Ӂ/���葰����H�2�hb�tv��s��R���u�<\��CD.;���Z�v��o�u���`
G�;i�s�!�ː�޹8�҉�s��l�Ÿ�!�ޢ�.T*�p�yR�S���񪩲4 }Y|�޹ÿl�����}����nʵ帮$a�Yr�����S��'K>�L�y�������(��x�+_7�7���A̞i���3��r���	&�{q�2��i纉������,�2�Y/���� �C��}��:���3Un��3ʖ4���v����ɘH��7�C~�{"jlT_[%.�Hm�1��2�_�<�<#z_�6��v�-B��߅�¿qU0�/�G]kR5��Q�vq�������p��Y�G�7�<u�#�^��vf�;�YR唆�cy��y�XB���)�zg��;|�>�3� nsC�(�ҥ�s�6g�O=�[+��zҠ��~;T�����Or�h�J;B9~j�Z��+G=��>n���� �C�B�G�2{��5���j�`)r5�Y}=���<��>�<9j��q�p�`�Vv�6	�uF�|A��D�Ky\�}n6�'��b9S+O*HG�ew��]����ȒX��.�娑T��x���f.��ͺ`��y��}m�u���M����S���S��j7Cf�HU��sS��Z'窎�����w��H��lP��-!�b����N*���G�U�K�M˴]�O�zr#������=��zi�Lˏ�o����lË�N\    �m�wnm{��D
cg�
?�)�IuT��R�!��i[����:�E���ֻ��LG�v���MͲ�b�a�\����QPĊ,�����I@�����,�@����CGz�s����Y���"��� P���d8h�P�D�k��S�:�P�G\7�Mߺa�"�Q����̀�_`dj$w����}��U��h�	E�Y&���������yd\�UNX~ٟ:@d�mA�{g��n��a��d��BD��h�9��sy�S�߹7�F�Ϳ+Ȋ�\��x?&���kX�fəm�n=`�
�6 oFL�;��q��(���=X��+�Q�ԵR��d�=_g��W|������}[e+�(i��@����mJ�B���>��Wdl�*	zzk�`��.��Z��y��D"�h\�����?���ϙT,7i_Ǳ˃��L	Eh���zd��RaY�ͧ�����8��N��O������6O&Fqzd1���i^o����­���d/�a]R-C.zx��J�3�Ȣ���X���(��s�cN�S�2V&��Lulg:>w2�>�&��W�[G��=���23���É�9�,���T��Wg.H�2��c����iS�[���
<�d�Sjx���?��}��-W��u�+RM�C}�t²�QB8�w.�ϥ� b�C�/�D�iж�sr�O�`ȥh8IK�J{E6���c���*��$7v��G����'��������4����y\���d�����@�/e��o��M�)ģpo��F�� ������D�[�9��8���xP���YYn2��iH�X\�+���QQ��g���A�[�wR��H�~tR�{J�f��DH��l8uqw��sSC�{@�a��t����"j��ȵ�ѿR8��x���C�.��2��>%�K���@$Ϫ7����W�=�b`�.�!L	��0�m�1yJ3��S︌��@<���p:�a��PN	��5��r�}e�tk\r��A������
r�y��"ǃӶR�d����M���ڠ�~!�:M�##E]����T�&�bC'�z_8�i*.�g_q�+�T���u��{��<��;ƍ����B����廏\M(Ph<=�d�Жhk������ڒM� �Ք�M�el;�5R,J������5ۈe�'�@b�<r�+Æ�Ư�R����cZ���uO�&���J���C���<����p���vX]/�>w�&��W^>��s���C����M������%!�{���Q#Q�� �^��b���
Y���^��sd<��[��)d�(����sR����m�F�H�w:\����US2��Q�Tr�ޡ�δ�����=��7H,������H����B��ר�G���x��	�����Pa/��C<Fb�J>��l�]\2)��r���"_5�_@v̝����i�G��u��ō�EG�����9,rE����&x8Bb��_6%)�;�Ȥ��'�iVJ�E�m���?�LH�CZ������Ha��c�jS�5��6Ԉ� ������T�.��%	9|��w�$+#�[��ʀo_���vN��[LT����Q��j=.�������t�KxǫC!LD�jf;�,wT!a�d�{u��z����}u_۵����Ƨߴ,����̡�7z��LroQ��lc�!5�d���`>����+�7�?Sd�%8k9�Kw]R�T0V��c���y�(s��Z��v����mi5�<�i�np�q\��r��ܖ�;i�X�A���
��[�B]�
r�\հji�7k�Ё������=u�v������H�q������T-��E�G�r�����G�{�sGK_��X0À���pG���?�0�����F�OT+>�-ڎ�9e���=��gBe����5QZ8�dᢌY'�cRm%H�F�m$����ϭ$>�g�r�|�=NnV�X��S��Z���$�@�9�B���y�=����&&6�.��Xs��hŅs���e������b�Z	NMD;ߛw�p�k;�%��t��+R4Br�md珁L+-t/��|@s���+kԆG���	��6������h[�s���ט"�?��|�7O�J�Ϙ�;=���U_�֟c0���=���}�-)�{�mz�#ɠ�TdlT!)�%�L��6�.���iA1�����D9M��_�hz�����KҘ�qמ�+��/.Ul7r�^n�]���N�}�`��7K�N�%�A�3҆���c�!�4RO�4d�tZWJ��FI�����%�6�;��aߋo��'�')�(vɥ@
!u�n^�UB3�ع�v���j�GU�1i��ު{�@Y[���Ƕ���-���|�	�$"R�_�ooH&��+n�}�{��V%��D.��9���ζ����4�I���s+5��%A���g�>&��)x�`� |ņ����#m􏲀\jA]�����>�$�%�؝Ć�=��jH�?dW��=]�y�;.XhdM�9��÷��N�[�R����-�]�~�TnS���{�{U��N���P�u���P��,�1�r��`���h���a��&ϭ+�6s��*��H���aɢ�B9ޟ��/��2��Α�'?��q�ʓ5'GՀ��v����[�ǅ��x�p
��Y��
�<�jN�*�U\��\��������s��{!Z	�"~ݩ?(�{s�!AGA�A~��}�5�.J�m�^<~���b_�"sI�f�+����:�֣�o�=���GG��x|�v�^��[����N�?�UT����Q�H�e�D�����"=n�ԏX�%��'x�&Ut"aA���
�b�P�"��:�"�Z�1?�'l�f0I��Zۉ��z��͑��:�:MW�Cc{�F~Ƃ������1a���R�:jH_%5�Kی����]{�4	빵hb]��u#�d�;@U���T�>��M�/����Ev2���@tN+�D<��,�PI\��lz ����%�:6S��T/����6��;G�QH#Lӎ9b�S��nc����=��+��\)�b��M���/�~t�P����A��)�O��R�jT_U�)"q�Rv�U�E����U����ua���X�����`�-��W�z�D���[8a�NIt�B�\��mV3^k�m+����v�����1u��W�P\�dW	#����E���<�6�!c,zN^������a�zu2����p-��K'��O��G;�m�X�=��n���tnKp����!�zlUD�Ē�Wjn".+�s��cH�a'�W��t�wu�s�b�my�V��:0%	G���A�+. 5u���g�iLSu#r~B6,��E�Kn�okkE�|d����N�)y���
�� .+�b�1$��-︞l<[�����x��~ҭErAw69��[�T��6���{'�8�'�>��S���ȑ�+.���F���L��C��<�h�C�ȣ�>�o:c�B�mR�Ĕ	Gv�Bagݍ���O	�:��s�S�/_�4(i%(�Um�a���9F��J>������(��}��2�U6j�Lb&�'��&���w�Ag�C�=>	k�?Vl�괹�Q�B�H�`�*_Jn��s	�Dn����}�Gol�>\.Q�șl�9p�^����u{�0�kf�tM�L�L$2j�%�q�Q�x�@�Vu� a��(�*m�~����td�K��
$4$��� �Ue�-)Y�WՑh��L��`r�9�28Ղ�=�\_#��Շ�!~v\�k���|�A�����4A׷�n�<��'mr)��B����;�X�?G=�q�G�q%��Ò,�po$&*���]P���%iy�$��L��VF)a#]6�9���|��%I�8��tT%O�B�}�Y���T�A5>�~U}I��������5՜o����.A#5�l��/�Jl���f�s���I�����),���͍�4&���|MWQnJz�4��.��4"��v�'᜚�Bd:�X�u�z�p�����<��+��P�N"�^���̩�1D�qwz�U��Gf'��5��r:5C)    w��s�*z�4}��p���%��:�,�Z��+f�~+��HHmI,��y��1�뽟k��ʎ��{�(6�vT��4�Q�� \��JK�"x��ä>^�{�4%�0��rN��@$M�]��a]څ��:�}o�=M�9k�%�O��f�����H\t#��?g���J^��,���py�jz�kzCr9xfw����O��]pЅ�
�����խE�l<�� �#�
�RN(	�J�ב�C)b>����Xz��cD�)�l}����`w[VO��[i�&�I�~-���D�TR������"?���"�Jo�{S[���-���7N�cҶ�����6	&ЄD�U�=-:�3��J�����d�<z]f;rc�'C�PB��D���dA�)�UE
�7�5"r��җ=7w~�fb�`bx�r�
֍T\��"׌4.����Ȧf��R�@�|���/���{
]���m$GT�%ub,��=J�繹t��kI&�S��(~NM�F�گ��w����۾X�&]͗��M��������1UD�_��v�(���B�p��UQ����t�C��x�G���dN�?>U�eS���^�]njq�dW���I<�䀇���'zԽ�u
�Z��$����[[�<�{�4�h����3*BZ�bRt�/d�Gu��:Q9�<3�V%�I�!=��R�i �ۚ���kd�쓆��%�	cn�}�<��걍"MF-�M�(�P�#*����eZ|�h\�@C�?���p�Fb���s8��Q=\7n���QR�ܒ��E*l�qH\�1�Dj����qS��J{���A�V2���@O���Q��e�L�K��Br�u�L�Au�2Y|d�_cx*DQ���_)��:ō|-�;��-���TUt�mRY�g�?%[�%�! ��3Əw[1�Ŧf�	��0�_(��~<�'�ٖ�T�������n�B�-�t�^�;jA��H�����ĕ�#��{�o�$y��R��UJ�퉗,�<P˓$ء�<�1#�7͖��9������z���kI�O��J2U��MRi)$�����={(��p���C��JD:�I�
9�88�{��p��P��X�d����p��������\�O��r5���J�|!�����K\4��˿�sO�bB�Ao��<J1��J��㽜�'|Vڽ�6i����G��w��)�����K$h�*��߄�4A'��n;�X�	����}�לelB^�=͈TA���H~�N�����Մ�ڍ4��.�#��:@UJ:����]�rgY5�w�1�*.��]#�M�_�{?�������n���a"�9p�=a��+k���U#���ҿ}���-��ҧ�:t"�py�$r���Mpe�e�E�I����i����	섒�:���5Q�{�Nq?(8��<py�>�a�K2f�����i$��j��>�A��M��/;��>h<QS�k4���)g]���!~�[��݊�;Z��^�D�۸��xm��x6Y��'���ʠ��+��+��ņP�R"}��m�F�=�CKy�x�ԃ򬌸��n��:�H�D��X��M?;r
���J�vI�̒մ�/紱2��(8��t��!���S�~�i;����g���f�Z�m O�EP!�]�;��d��������z��?fO�d�9�����cR£���&�d��+�Ug$� !��"�wM���[���o�Ja\�A�*8Ռ4=��kߴ�{��ߙzM���T9����~��r��l���\�aڞ��;����L�����$�%bտ��"�Z�T$ؤ��.sE�ɵ-����sV����a�J�N�}�]D��W7}^�e��q�D�@�m��|2�.���=�Nž�+��Q��Mdl-��F,O��B۔ɉ_/[�6�RI��^16_��%��*����+ԕ��0o�<?';�d^b�P���}�BIj��/����R��������x��}o�ݦ.�i�,xR�n�옞;2!��~KțQ��R���K��pI$�3ޒ��T�����<��'1����R��.���ʞ���F�?���[eUH�O�����u$�R׬�e�M9�w���g�jI�K����iJ�Kk[�zFVIו{�}kK�ߴ��c$�;� �+�[=ġ��R�$���e�x��P�z$ʭ�t%���W~@d�ā
�����w����(�ktvz̃��|���$��u���Ü&rrGPph�껏�ʆs>�ܙX���yo~&�Y$js����W�Wk�c� "�ÛώӶ4E�qAl}LT�NrH�TrZ"��Ca�.\���<�$w�'����=�8!���r�CIb����N���(�<�b��#����w�՛���ڦ$�{���_;L�^��A��L���G��B�`	���3�����jԏwN^,r��<�}�9rJ�������ii]���4�|}�[?�T��%s��Z�Y2Ř��K.�� 9�V��c?,�G�H�$�77�N�&�s�)�`�-T�#w�[��?$�������ٻ-���'X怨"�
����HD1Z�*Ab�Ӟ��{��C��^����]ε4f�\��t�z����GG�`��j�t��dkp�p�^�
2)�)J����K�*�6\jMq�EFA�+��?h�&6���g1���=#�h@�H�����<(�A�!��� |k�orcH��W�I2"%�$`�TC�E���YBZD�"C͏��w��U���Wu��\��&�_T<�K�H�Y��w���ˋ��Fut�qij���M]�_�4�"�%W��\S#y�ڮ�,�!=����>R�Z*�Cj��*�ilR�k/�1bϝ�c���6n5@0Q�7��Q��ϐH�J��Y�����<�۲�_f��_���dSn�y����/Qr��EdG)�9�t�!x�����?��fӧ�J�;C:r!����e�I�⯑7J�\CY��?H�
_9YL
)DşuD�yrlv����L�J;ױ#K�L�{�?����M	
I�YU���(��A2��x"]�tr���=Z��~c�5�;�ì�s=!n����;u֫4fj�J��a�i8N�^��￵/k�ܹa�Q�_��đ6����>��=7m���{T�uq=g��T8�%7�jG���2Pt�tԥ���+�m�N�9���#8�ew��v�4� ���9��m#��ÙF�=�jd�O��w��-�ޣ�D�D.�D�?���`Öc�m���sL�{Uo�yw�+*.��Z!�T�,j�1)�M�2���>�Y��r��N΀e��7u;n_�_W��U���m�ߣ�l8�9�
�AH�"���i?i.*"�����d�k؎�1|�6�odJ)�
8�[Z��u��x�H��F��+E�SRr�H����?�#+���j�!�={�(�L�w�BU�=S����3p��SoHAn���PJ�Gd�i�=s�3��q큚�`��;��'��S	cE��_&�I��%���$!�H�9x�2,��È���Lg<�I$�9\�ܗ�-aZ���d��er��_�h4�*��>���^2OY w#��δ"x��5:T���Y&E{�$���Y�� rȷo�-4t�IFfcE�Fz?�|�ȓ�}���E6Eҥ�G�_��N�v8�k�
��y\�i���F@�����r,<|�.T��K��7P�N��"�$�d�U)���n&���+���ׯ�XQp�nd$��%��V®� �_�sB�_�_���>�ֿ5|ŭz�b7�<�7�;�e��7��Fd+l�6
�*��׸�3�pܭ(��)?s�Yve#)C${O��k�.���-�6[�Om��u�qo�qܖ��E�g��BE�o�޷F�P�H��C,������?>�qk��#X6<�
�u��@��xp�G�,wl�0Lg#��c����QVwJU2�S�U������m�vF����j���͞
a�HL��IS	=��Ҋ-N*nSG�k�����'��)~��QJ�n�Dov`��\C���RD�t���^s�>u/&�l��/!kg!��5*Կ$��DX���E'Y; ��!uRϬ�HK���O!�r/f

    �������H�.�b�JH\�b������0�\%�?Bɍ�pSɛ�I�G�N����6��J��Öĉط׻�m�+�,�}��pa�gb;%s�I�l-�I1M��d���!|�?�I&�ɥ[i�(���ԞpꖏxlEURm�<��S����pG�M�>��u��W� �[D<K��޺�]�����PrYfws��r�r���%��S�n�-�så������Te)s��Q�4&�#��ۅ�$��ٞ��燰�7��<F�g~k���NU�1$3������9���43s��K��\��}�w����3UyLY��o��5�����L��S��!2��r�☧ Ѱ$v�]�q:C��A�&=�ϳ�M�H��䇟�=?6�Z�B���<cg���ט�@%�j�_#���Þj�mG�a����I�f��Un��^�'��^&c�p���t%%{��`M��<w-��@h&�M�o�j�{�HǷi���z�_n�2�TM����X=RR؀�;�)S͋�W(�,�v!gO������hx�_�y�w�IBtf���p���HU�ʿR�*,j��e����v��gE�~��Gz+"|��'1��X{mr��=�'�E�AV�վj9d�	~9�^�����ʆ�
��@�6��}�#g��\g���{O�ݍ��ӭr��qz�0F͡�Nk�{R�Տ�D�_�O�X��]n���pq����b�6�sTD�A��Z� �O�<��s�/�B�.��?J�Ù�Iu�̡ �l�pv�n�;ҸO����K����wS�冔us��E�q���[�Ր�o�L����ӆ���F﵎J9��J-^z,92�:%�p�.dqs����m0qn?�W*�s���e�ߎ������Rde�Q���<�����Y77/������U�����"�R��f��.{����ց�F����aNnn?��O�w�b'���<U}@25i�c��O�}6=�@ꓟ��Z���y�b�H�L���Mxz�칹�=���ϝ�1I��r���Km�&���RSp࣓�(�fߛ��?q�2���G�>mJt�"䩉=rL5��f��|F-x�����e��GGe���,��܋D�[#Q�F��]ypAT'�W2,O}��~��I!S��;�w�
��J(��4��N����=����/�5d�� �����aJ���^k���Y��jΉ�c���%�5� ��s���#�Ah!�<���x�t����\�8`w/���O�BR?�]��c׉��p�l�Q����Rۻ�p��{:�y�?,n��AۨH���3�,O&�.�F���"��v*�ߝ�������8��vc��
�jk��cY�.�����DT�1�gÅ��L��F:[��Jd�>d﹈[SCQ>��f�����~Q��)�#���0��F,������u��� c�zA
�%���C�}�J����@�B6�����(ʻ$oq�h\����/(g�juw4A��z�Rc�q^e�u!k�o��\
lS��)����Um>�NTj�s����1�)�ۢC�g��������s#�=�Y�;6rI2c�܀|W�/�L*x׆@��"��t�9W�/�\�݀�R�F��B�¹���ҳ�����f��8z�%�{dV�ä����ې�QS���z���\�):9�S�c��)����&U�F���u�8��f����U-A�jJx̓�����묷"R�����H:��ue���H�l{����]MJ"���r8��ԸR�؇X�Ww��#��hmgږ����\*�ߙ}d[�?��I��>Qw��@�T�H�Sh=f{���{~�[�F5����Sg�T��c�H&|�Kt�L6W|��-�5b?EC�R&8������d5Vb3Q\�UjHJ�n�v)�������T��j��y��(;�2Td(.R�;g
��l��X�ݫ��[H��>!���4�VpMԡm�n��H���6��?���G%��qkHض�#�Fە�Q��s��0WCm��q��ZȑM͘�hk��8tE-8��D�����!MO����ۚ���߱Hb�C�Rݛ/���{n5n��k,�7LG֡�U�9��ˬC��̾w�3/��+��ԫ6�.��}��d�S����]��9�tJK���ʋ+�1��\�CP�l]ڢ���ȯw��4PB��r���$�[,��ؑr�u�q����B��-v�2ʒ�����c���8F���HF���	��S f�p��f_M�OW���EQC3��l�S�Vl�^��9m8%l-�
`1
�(E�����#�|U����\c�OBޟ���y�	e8�Ieb�)�@JŁ�B!Ǿ:v;k�=O���s��ie}i�[D�	)�,V���Q�#{���"��Dx����Ijఆ�$w�4��}�c
��}�B��5ZY9�6���/(.1UA��!���R�r�����WA�pMjK�]ʪ}��I�y���OI��=���ƒ�нL����F ��F�}�th,#��p����(*�p��M�߻ɤ���q�sǞ<w��Q��CO����>�������y�3~6�J�o�G�y\�ŘH-��.�-��YM��M��p��
�Qh��]���0�غy�m��Y��B/n\S7%	��אw��<�W��|\����B�z�/m��aq
7�gf�Yw�X�fk�[|�W46*v59��g"���'��HOQ�{��șՍ:e0��N��v�{��4Yb/G74����,��\�%�*Is=I����+����p���!-8k����V���g"AWzu��B�e_����M9d\�xS������8���1�Kw���+� �D'��i��J�1�6�r��%���\�8��pm��[�\~s![�k|����@v�5��tQ����n��:uCBQ���J����ϟR��o�$�&
����W4��WrÛ�l���F�:p92���|���Q�g�sddH��%dՌ��%?	>6Vb�h;��x�李���S�������@�?J۸x�x��.T�(RC�)<�ޟ�S1��F����Pg~�J��Wi�ً_I�Am_�c]`���#����W�T-�HZPpR�)��Ƣ��W内 c{.,���&k���w�����4Q�1��&dF�Z�1Q����9g�(�����T'�&[�����W[Vݔ��������s�a�4wHH�x�L�z[b�D��Ћ**�a�U�(���)�Le�T�G�5����+�X���m52���b��8�u���ل���mBv�u�Q�.�i��Bǒ�X$����6��|�);�'zN�~��z�|�&~
�{2C�WM���B4���Bz�����;}$Mf�г-�"S%Xm\�S%rׁ�$��RBى�M
�{u?�c�&1ݒčD<�rd.P�8Ԏ̱G����Y���O�g��-ŵ�'e���J��ƙJ6�Ҩa�<��JW��Ǟ�)��ZPm��\��-V%;�9���M<nw���y��.�%K�9<ҍW���A��X��9zb-�p��*�%��+7ڦ���_gJ�3G���G��t�hi��:�˅H&n�l����x�!G&�F��F�Lj_|�FB"P�l-��S@�ޠy3����}��]��j�m����LU�U��I�ϣJ�L@U8p��&�W�)�$�8dWFz>��2��w��B��#��:f�(<ý/��cû���$&�G�k`�0$g*����#��D{���d�=|��!5"\�d�$��ŏ=gt9�4��'J�篍�R)�L���j$��q��(��F��8����Q���L����?t�P�>��8�=^3��k6���*�P]BG�{у�����������qה��4�)u�mǅ2&��yMq|��{/����	ʙ,3un���UP���$&��e�����e���tp�e2,�#���)��b$��ʄ�3y����d{$�3X]�y�`�p�^{*��~�[�ӱP@��G1�:r�z��ͤ�l�m��6i���s�S^�OVj5u��xuN
�'����(� �  H3�7��-��̈́Ǘ�#[�vې�e��rlG�{.`��-�J�d{�n��O~x�>Ÿ��< )����Μ��9&�~ y��e�Źi�����p��G�H��P'a��cjB� �FsՄ��8�ґA��R�7{�0>}��3��^�'�=xK���4r�D�.���,�Y�IT�8�����;��������+�p���M��Xȍ�(sI�ɹ6X���N�ø���n��y��o��<�Y¯�EY�Z���.�1��$�2����C���5�ː���` (K�6j�V��(�и���t@�Qo/cthߦ����i��x���u��"Rfao2��u)�58��\'�R�ady߿HF%���ƻ�.I��j��si4p�߼T�n} �۷�I�s�r�dDp݋�۸</:�-{%�	�����������$cq������{�5����fܺY�׼���{�T.�?|���b� ��o�Ž(C���J�h�.v��O��$�dvio=Qw��a�ל8���*�����7��iDH�
�~����̜9������ryj�(N��a�:#�e2�W9]ڕ��l�ӷ�ND%��k�zZ1��C2��`���`qv#p���ZZ���k9�=˘~��(�	D{Wo�4U��?OE�l��EƁ?�Z��s�=)��G���^;;�Gb���f�7^=�o��Z8w�o�7�o�Nl��Wsp�LI������#�\��<wq�d��1�}�?�\Ca�9k<����\��Z&	Q�Y�u�������𵿃��g���鐲Q�)H�W!���Mგ��-�@�E��3���67�J Hr���%�=X��
I6{��p9]v:Mg}��>j%��Pw ��aή$�wlŐ�oq�	a�J��z� �6�g�!&�]�f�8�������l���I�,�.��M�B�$(��O�h�"x�����%�5�_�6[�-�b{����Q�*�ZA���s�:J���Ez�q�N�I�/&.�Q����@�/����PI�iG��Z_ﮞ�]�L��ƻ5\���>,Q
/���B���Q2�l��3��a'�3b�n�R��l\+���R\8H��E5�@����I��u�#�Z0�����q#Æ��"�!��<�aQm��O��Zh��b֯g�,�d�dn��ނ�F�Pw!\�~�	�ΝIqq���s�u�����֛�����O]�N��W(;���yi�"�HD"��bߛ�&m��sN��Ω�Kr?
�ʟ8/2�'b�3���~Sꑽ��eE��+*r�@P��[/��@�p���>��]!��"L�F�J�����i���0a��-��|O��T�C����5��Y��13�r_�>9e)��խ|Uve��q��bKe����|�)����Oeڤ�c(wo=ӆ�Q�����& rċ+�I^��tOI��ێ�]�<x���>Q?6ɡ˟����!���ln�o����W�*�\n;�T`ðu�s�Y#JR\���[e64�v*���B�l��}¢g>^�`�<���m��1=$_29!�%zٯ��Ա������m[^d��9]3>}[<f�"��Ԍ�y!��é,�|�3A�_��_˝>*��z����WW��2�-h%��-����*m+W~�����h =��ޘa�T��	�;v��@�F�
��2��a
�j*Fcdd���g`�J���<4K������1$_��Iә{a�e>[}<���S��[���X���R~��a�nCB��ԕ��_<�r������Оcl��#�m�?�H�G�v/���A���{�b�>D�r�P�A���w\8i��@�<��Yzbsb�6[��a$y�|��r�
[;'��7v�:/�j���s��8m���Dd�Ei��)7�ʀ�/��wH!�_����5�P����	���hpi�ë�8[{'�T���ˇ�
��V*#Y�X�v���rs�X���lgG��_(Vlщ��R<���dd
'��-p�r�UwV2��I`�GҤ?0	�[�`���t�bLE������5)�Do7��w�25&�ce��j|xDs�b�{ �z�ZӲ5�zn�S�n�X����+��1� �D�Q�W�F�Re1�VOWo��f�F]s0K�s�v����=��)�ن6���s���t{6�u���?��!E}՜��3P}�('3~����d���|-i��"C.S2��L5r����L񓪚[u�rZ�sϚ�D�*�q̨�Z$^;oB�K���]�c����3mg��[H�{�-�zQ�+����Y��)�\��ց:v��>��Z2�Dr�Kx��2�gj��9I�X&�@Ds��_־"h���|�����oBݶ�y8�p҅�+wu��`J����dd�]�|�u��64u��h�ֶ�bk�b�u�bd����ӣ��_t3�><Kޑ�[.����x��\���8C����@ U0�����"��4��]�S	Y�\M�~)�n����-8ѫ��˸T�f��t2W���k����!�EB��Y7��<����H�u���;��OxU����v�[*�x[�a��L��#�o���[<�1˜-����׽����y&�,C�K�`��D�	���'�d�!�O͛�f��g�]�L<ۺ��\	����3�.=��'�Eb��wÃ���������-����F2#�{9J��ug��*�g�����]�n������y���������s�]�o=�/d"�������w��*k�lr�KK���	���0�܊\�\�sB���n��jy��ߛ�;���z�:Q�fŅfG���uV��4��º���ò���'Q�S mS��.�D�B��TK��5I�49=��ld��&�w:V]{,�b�y|�J<S!D��'�p���N��SL���/���5tN��;�flX��r�
�Ԅ	aj��+'��3���ǽ�����:Š��Qٺ~hi�gb�0�u`C<#7���p~��|�9/�P���IJ�5�
�qG!�N��lߵ�x8M����S��Z�O'�M�+
�ՠڂ�D�9�;�����N4� �Y��_8 Z��>�"E��=m+`@�W{�{0�o'��|hhI����v<�i��Kݍ���<|��.�U���^R�Vd���7��m��GMuq z{��B�FRk"��L�T�{s�B��3M�A�N�<n2�g���M����s�d����E� w8��O�n�'�п��w�"���TT�n��y�y��<e/g�J�Q������u�T���7Y�i�o���g��, �V��Lr��I�i56��zV߸O�#����J��\w��hU�
�Q�ac�-�b8�t	gե!t�f�{��e����LgD���G����>^�u�`]��sg�t��/��̏V�߾-����D�Ƌ%&Z.�i/�+�|�2Ϗ�����+/	��p�sA��(��Q�/$QR���Z���c�>Y�cC�>ncW�P��~h��� pf�=�
Ymvt���K��ϒτf�.0ukL�Ǝ�E��e�5!v�vV��hg%O�;������{9w����lSS� ��������$,�Bˢ,?����#�
���lnp"�M�H/]���뗛t��3����+��/��� a��oaO�:ό�8O��Y���ി��w�L'��>,.��M���w���Y툸������T�EbV��:��Lq1����v`C�ѱ�o���M={����餘���h3�qM��G���K���a�J�vQ�E�w{L8��e��X��ѓza4�|q)���t�'����:�5�v*�h�3�S�<2�]�N�We�a;�����[_�V�N�=�A�e�:i���(˥mh��¹��v����?��&�潢f�*Ϸ��C���Ez�fn����_���=<Uy��lִ�K���鯓����t��\�q���V�h�>�I�)W��I���&����I���P�m��Ѹ�׫�%���s����ݽ��?�������      7   �  x�͚Mw�6���+Xu�rFBX���f�MRg�f���r�pN�}%�/4�r�5s�GW���C�g�_��"o����:��9x?�g�.(�˥,�����)8�G��)�vAU�K���w䟛���)��<�r���ײ�B��C1�ԏ���ʃ��l��>]�Wu�x)�Cw�?����4#�t�e�'^`�by.�c~	ޓ+�E|�/�����!q�'v�f����˨i���1�c���Ӫ~������uݼ��ڛ�����t/~���zS@'i��|�=|&ß��m+r�ӧ}�R}���#=\���}T�4w2pc�{1�B���'R<�=�q�2X^�v��yġ[z�r����Y�	c�S�=�եꫲ>�͏�E?��tLwXN�^zx�C���\z�ŋ[�zz�J��Kp��'����ߐ�+��,A�&�`N> �,��~��`<�0�>�|Rts�sg ���SF�4ı��;&͔x��H�2�4��B<.��o�R~zQ��	���}|�bp-�ۥ�c/�I�f>�B�� q  �@(� F�$pB�	���g �=.��q3�],?p�Z��z,�αێ�\}���uP� �!4���H�Y��[P`�D�ɖ �y�>.�N�3#@�kQ�%i�����ߐ�+�� H�O�2���k�-��r��2�P�1��I،�aƝZQ�=8b�Àc�8
1�s/G�18ao�2�X����[�͐w����azKΝ"gʺB=���ь4���C��0`� !�_4��e�0�/��LDl��\��>#
�'e=X�(8��1p[���p�:��y\ڭ�ߜs��K�O�i�ǒ�C�]��F���!��/S�H��N�3.��e.�#�|ˤ��.���~|ʝw%�r	r�G�p̡9��S0���H��%�P~�l6@P}�-���B��FЛ-[�.)��)u���u9Ȥ�,#�&�(X��d��C�G~����;�G	0׾���g��F�4q���ؽY���3��f��s`(Eʁ��yٷs�?H�>�bA�����G�?�<�,���R�ѬO=N�S}�X}U�Es�_~֕�,�(�0��۟�s�����˾yξ*���f��h��c���&��^o�����տ�֥����`�����N��I��e㷳�
�ھ����w������{�x��ľ��];|���,�`o���˦�9ow}���e��9V��m#�y�o�U۷�_)6����I̶��o�|�J�w��������i��7u?	o�v7��7�7���b�uƏ%>�6~;��Ͷo�^"�>�Xx>F�D�|7����c�OT��![��:�D���5�:�����h�r�F��:�tu};{���(�m��+�A������on�J�w����>F������0��߮�_�}�J����S�*��ï�>�濫������c�Mfv|Gl�5{���x�w�~��M=P&��v���g���uG���X�3��;�˾��1�gW|�Q����o�r+y?'Yy?�e���k�/�-�:�Lu}�}�S��r2�����י�y�`ph��e^뮦��%���v�|����΋��H�̗[�8�01�)�q�槽��|j��*ֱ���,�jُ/{y¼������꾼\�璲&'n��h���!3}�ӌTp��̹N�ߚ�*kz'��*���?ӌ�_������ڶ�6�	IA�̛d�?������'�      :   �   x�31�4661I�M6L3�5I1K�M23K�M13674NKK63N�LL��̃����9�z���Pq�DC�����R#�� C�����2�(G���2}3��`��s��"�tG�� �
�J�=... Lm'�      9   �  x�U�˲�����6V$!\��(
xED��I  ""xy�����3;���QT�˸D��H`�IAID�T�N�B�*!E�)X=���No͇o�{��3>,�����?@�������M��ܜ�	F�x?mƥy���mA�t�y�d҈/M�h,�ڟ��Oyn���`�xn��{�1=v��I b�VU�X�Y��i�K`��r�
Ìqؑ��rXUb�D�PP$������`K�yy�߆�}�/�O��e�%�Ǉ�z��l�r��9;���m�ӗ�`Ĝ��q���I#_5!�E|�����;��*Ӓ�G�����Y����5�nO�ч�0t�@PA�8J!�T@X$!(I���P��d�,�+��Y�x�_<�T�E�
A����N�B	"�6��*�ț��Yhɥ���g^n��&����d����p�̡l�����U�w;�IT����bC���}�!iȉ@�9���T���
D�Q�z�� ��i�c�䣷���G_����b!ڪ!X���-�A��*������r�֔F�:_h��J��\�ou=��|�����h>N����� ���]�T86&޶O�/��݀H��ÜJA�1(E@��ɵ��1��^������|��/�jW��C�|�Ǧu���u��	��m{����2��-\mF��J������k益��qN�v<��l�)�_�4[%�SΕ��.ϯ摉��I�W�k#�8�C�$rX���DD���A�=-OC6���s]�{����_���9}i��v�%�iƿ�KAh�a\L��v��2D^�O�|Vo��Z��/ME�IP��R�Ю��.f�9�
�q����n��6��_&Ǧ�E*t#�H����Q	 N�@"XVH�}�A]���G��OA���
��}A���T����4�olCL?�:����u����D��z�����J2;h����E��v��{]i�^:y0w,-�jo�!��֌�X�Q��"�5�G`��M��n *�F%���Ғ���������o����G��o�`��,���b3wq|��Ot��A[� ��dj�M���y�xuxiF�����������������TJ�:����<֧2f*('��˂�"s$~?/q
��5B���G�ѵ��{�9�x�ֿ8>q�%1�{
��t���n{m�;G���F�j���f��im1���k^�?m�@HU�9�7�|���f[�og�Z�>�W*���e�j|����-�LQ�umK趱J8�p���{"+@��+�d�X/y+>g�G�Ϳ��Μ��0ةR�0nWK�y]��*P���b2\9I� �}��YZҚ?�09%�`��|�܇y���j�V��r
·�t��865vW�ݏQ����8I	#� #q4Ġ{�.��Wr�~��'=~��1�X>���座�&/॑�����`�f�������eiŉ�\��61������h�������(�=�\�9O���}���#=K#������~�_	��     