package main

func arrayContains(a []string, v string) bool {
	for _, element := range a {
		if element == v {
			return true
		}
	}
	return false
}