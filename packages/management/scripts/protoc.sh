# generate js codes via grpc-tools
yarn protoc-gen-grpc \
--js_out=import_style=commonjs,binary:./__generated__ \
--grpc_out=./__generated__ \
--proto_path ./proto ./proto/*.proto

# generate d.ts codes
yarn protoc-gen-grpc-ts --ts_out=service=true:__generated__ --proto_path ./proto ./proto/*.proto