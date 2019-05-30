# /bin/bash
find -E . -regex '.*\.(js|map)' -not -path "**/node_modules/*" -delete