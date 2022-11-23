#!/bin/bash

printn() {
  echo -n "$1"
  if [[ ! -z "$2" ]]; then echo; fi
}

print_err () {
  tput sgr0;
  tput bold;
  tput setaf 1;
  echo -n "$1"
  tput sgr0;
  
  if [[ -z "$2" ]]; then echo; fi
}

print_ok () {
  tput sgr0;
  tput bold;
  tput setaf 2;
  echo -n "$1"
  tput sgr0;
  
  if [[ ! -z "$2" ]]; then echo; fi
}

print_wrn () {
  tput sgr0;
  tput bold;
  tput setaf 3;
  echo -n "$1"
  tput sgr0;
  
  if [[ -z "$2" ]]; then echo; fi
}

print_inf () {
  tput sgr0;
  tput bold;
  tput setaf 6;
  echo -n "$1"
  tput sgr0;
  
  if [[ ! -z "$2" ]]; then echo; fi
}

print_title () {
  tput sgr0;
  echo
  tput bold;
  tput setaf 21;
  tput setab 7;
  echo -n "$1"
  tput sgr0;
}
